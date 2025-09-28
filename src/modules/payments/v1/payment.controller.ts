// src/modules/payments/payment.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Get, 
  Query, 
  UseGuards, 
  Req, 
  Headers, 
  InternalServerErrorException, 
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import { Request } from 'express'; 
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentService } from '../payment.service'
import { StripeMockService } from '../../../shared/stripe-mock/stripe-mock.service';

@ApiTags('payments (v1)')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentController {
  constructor(
    private readonly stripeMockService: StripeMockService,
    private readonly paymentService: PaymentService
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/request')
  async requestPayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.requestPayment(dto);
  }

  // for webhooks after payment
  @ApiExcludeEndpoint()
  @Post('/webhooks')
  @HttpCode(HttpStatus.OK) 
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;
    try {
      const rawBody = req.rawBody as Buffer; 

      event = this.stripeMockService.constructEvent(rawBody, signature);
    } catch (error) {
      throw new InternalServerErrorException('Webhook signature verification failed.');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': // payment success
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata.invoiceId as string; 
        if (!invoiceId) {
          console.error('Missing sessionId in Payment Intent metadata. Cannot link to internal PaymentRecord.');
          break; 
        }
        
        try {
          await this.paymentService.handlePaymentWebhook(invoiceId);
        } catch (dbError) {
          console.error('Error processing payment webhook and updating database:', dbError);
        }
        break;
      
      case 'payment_intent.payment_failed':
        console.warn(`Payment failed for intent: ${event.data.object.id}`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}. Ignoring.`);
    }
    return { received: true };
  }

  // success or cancel url
  @ApiExcludeEndpoint()
  @Get('/callback')
  async callbackPayment(@Query('status') status?: string) {
    if (status === 'success') {
      return 'Payment Success.....';
    } else {
      return 'Payment Failed (Status: ' + (status || 'Not Provided') + ').....';
    }
  }
}