// src/modules/payments/payment.service.ts
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { Prisma, InvoiceStatus, PaymentStatus } from '@prisma/client';
import { InvoiceService } from '../invoices/invoice.service';
import { StripeMockService } from 'src/shared/stripe-mock/stripe-mock.service';
import { PaymentRepository } from './payment.repository';
import { InvoiceRepository } from '../invoices/invoice.repository';
import { InvoiceBaseResult } from '../invoices/invoice.type';
import { PaymentResult } from './payment.type';
import { InitiatePaymentDto } from './v1/dto/initiate-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly stripeMockService: StripeMockService,
    @Inject(forwardRef(() => InvoiceService))
    private readonly InvoiceService: InvoiceService,
  ) {}

  async requestPayment(dto: InitiatePaymentDto): Promise<{ paymentUrl: string; paymentRecord: any }> {
  
    const invoiceId = dto.invoiceId; 
    const invoice = await this.invoiceRepository.findDetailById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }
    const allowedStatuses = [InvoiceStatus.DRAFT, InvoiceStatus.UNPAID];
    if (!allowedStatuses.includes(invoice.status as any)) {
      throw new BadRequestException(`Invoice status (${invoice.status}) prevents payment request.`);
    }
    const amount = invoice.amount.toNumber();
    let paymentRecord = await this.paymentRepository.findPaymentByInvoice(invoiceId);
    let gatewayResponse: any;
    let isNewPayment = false;

    // check session payment
    if (paymentRecord) {
      gatewayResponse = await this.stripeMockService.retrievePaymentSession(paymentRecord.transactionRef);
    } else {
      gatewayResponse = await this.stripeMockService.createPaymentSession(invoiceId, amount, invoice.items.length);
      isNewPayment = true;
    }

    if (!gatewayResponse || !gatewayResponse.paymentUrl) {
      throw new InternalServerErrorException('Payment gateway failed to provide a valid checkout URL.');
    }
    
    if (isNewPayment) {
      // create payment
      paymentRecord = await this.paymentRepository.createPaymentRecord(
        invoiceId,
        invoice.amount,
        gatewayResponse.paymentMethodId,
        gatewayResponse.transactionRef,
        PaymentStatus.PENDING,
      );
    }

    if (invoice.status !== InvoiceStatus.UNPAID) {
      await this.InvoiceService.updateStatusFromPayment(invoiceId, InvoiceStatus.UNPAID);
    }
    if (!paymentRecord) {
        throw new InternalServerErrorException('Payment record could not be created or retrieved.');
    }
    
    return { paymentUrl: gatewayResponse.paymentUrl, paymentRecord };
  }

  // webhook handler
  async handlePaymentWebhook(invoiceId: string): Promise<{ invoice: InvoiceBaseResult; payment: PaymentResult }> {
    const paymentRecord = await this.paymentRepository.findPaymentByInvoice(invoiceId); 
    if (!paymentRecord) {
      throw new NotFoundException(`Payment record for invoice ${invoiceId} not found.`);
    }
    const newPaymentStatus = PaymentStatus.SUCCESS;
    const newInvoiceStatus = InvoiceStatus.PAID; 
    // update status
    const transactionRef = paymentRecord.transactionRef;
    const updateResults = await this.invoiceRepository.updatePaymentAndInvoiceStatus(
      invoiceId,
      paymentRecord.id,
      newPaymentStatus,
      newInvoiceStatus,
      JSON.stringify({ eventSource: 'Stripe Webhook Event', transactionRef, status: 'SUCCESS' }),
    );

    return updateResults;
  }
}