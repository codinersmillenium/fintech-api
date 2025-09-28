// src/modules/invoices/invoice.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma, InvoiceStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateInvoiceItemPayload, 
  InvoiceDetailResult, 
  InvoiceBaseResult,
  invoiceDetailSelect,
  invoiceBaseSelect,
} from './invoice.type';
import { paymentSelect, PaymentResult } from '../payments/payment.type';


@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // generate invoice
  async createInvoice(
    customerId: string,
    items: CreateInvoiceItemPayload[],
    totalAmount: Prisma.Decimal,
  ): Promise<InvoiceDetailResult> {
    return this.prisma.invoice.create({
      data: {
        customerId: customerId,
        amount: totalAmount,
        status: InvoiceStatus.UNPAID,
        items: {
          createMany: {
            data: items,
          },
        },
      },
      select: invoiceDetailSelect,
    }) as Promise<InvoiceDetailResult>;
  }
  
  // find invoice by id
  async findDetailById(invoiceId: string): Promise<InvoiceDetailResult | null> {
    return this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: invoiceDetailSelect,
    }) as Promise<InvoiceDetailResult | null>; // Casting sesuai type select
  }

  // update status invoice
  async updateStatus(invoiceId: string, status: InvoiceStatus): Promise<InvoiceBaseResult> {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: status },
      select: invoiceBaseSelect,
    }) as Promise<InvoiceBaseResult>;
  }

  // update status after hook
  async updatePaymentAndInvoiceStatus(
    invoiceId: string,
    paymentId: string,
    newPaymentStatus: PaymentStatus,
    newInvoiceStatus: InvoiceStatus,
    gatewayResponse?: string,
  ): Promise<{ invoice: InvoiceBaseResult; payment: PaymentResult }> {
    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { 
          status: newPaymentStatus,
          payAt: newPaymentStatus === PaymentStatus.SUCCESS ? new Date() : undefined,
          gatewayResponse: gatewayResponse,
        },
        select: paymentSelect,
      }) as PaymentResult;
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newInvoiceStatus },
        select: invoiceBaseSelect,
      }) as InvoiceBaseResult;
      
      return { invoice: updatedInvoice, payment: updatedPayment };
    });
  }
}