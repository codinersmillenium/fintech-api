// src/modules/payments/stripe-mock.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeMockService {
  private readonly logger = new Logger(StripeMockService.name);
  private stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly stripeSuccessURL: string;
  private readonly stripeCancelURL: string;
  private readonly stripeApiKey: string;
  constructor(private configService: ConfigService) {
    this.stripeApiKey = process.env.WEBHOOK_SECRET_KEY || "";
    this.webhookSecret = process.env.WEBHOOK_SIGN_KEY || "";
    this.stripeSuccessURL = process.env.WEBHOOK_CALLBACK_URL + '?status=success' || "";
    this.stripeCancelURL = process.env.WEBHOOK_CALLBACK_URL + '?status=failed' || "";
    if (!this.stripeApiKey) {
      throw new InternalServerErrorException('STRIPE_SECRET_KEY is not defined.');
    }
    
    // init stripe
    this.stripe = new Stripe(this.stripeApiKey, {
      apiVersion: '2025-08-27.basil', 
    });
    this.logger.log('Stripe Service initialized.');
  }

  // create payment session with stripe checkoun session
  async createPaymentSession(invoiceId: string, amount: number, quantity: number) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd', 
            product_data: {
              name: `Invoice #${invoiceId}`,
            },
            unit_amount: amount,
          },
          quantity: quantity,
        }],
        mode: 'payment',
        metadata: {
          invoiceId: invoiceId, 
        },
        success_url: this.stripeSuccessURL,
        cancel_url: this.stripeCancelURL
      });
      const transactionRef = session.id;
      return {
        paymentUrl: session.url,
        transactionRef: transactionRef,
        paymentMethodId: 1,
      };
    } catch (error) {
      this.logger.error('Error creating Stripe session:', error);
      throw new InternalServerErrorException('Failed to initiate payment with Stripe.');
    }
  }

  // get old payment session
  async retrievePaymentSession(transactionRef: string | null) {
    try {
      const data = await this.stripe.checkout.sessions.retrieve(transactionRef || '');
      if (!data) {
        this.logger.warn(`No active Stripe session found for invoice ID: ${transactionRef}.`);
        return null;
      }
      const existingSession = data;
      if (existingSession.status !== 'open') {
         this.logger.log(`Existing Stripe session for ${transactionRef} is not open (Status: ${existingSession.status}).`);
         return null; 
      }
      return {
        paymentUrl: existingSession.url,
        transactionRef: existingSession.id,
        paymentMethodId: 1, // from ref payment method
      };

    } catch (error) {
      this.logger.error('Error retrieving Stripe session list:', error);
      throw new InternalServerErrorException('Failed to retrieve payment session from Stripe due to API error.');
    }
  }
  
  // event webhook
  constructEvent(rawBody: string | Buffer, signature: string): Stripe.Event {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
      this.logger.log(`Webhook Event Verified: ${event.type}`);
      return event;
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new InternalServerErrorException('Webhook signature verification failed.'); 
    }
  }
}