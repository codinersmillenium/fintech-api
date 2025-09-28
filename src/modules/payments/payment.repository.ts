// src/modules/payments/v1/payment.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PaymentStatus } from '@prisma/client';
import { PaymentResult, paymentSelect } from './payment.type';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPaymentByRef(transactionRef: string): Promise<PaymentResult | null> {
    return this.prisma.payment.findUnique({
      where: { transactionRef },
      select: paymentSelect,
    });
  }

  async findPaymentByInvoice(invoiceId: string): Promise<PaymentResult | null> {
      return this.prisma.payment.findFirst({
          where: {
              invoiceId
          },
          orderBy: { createdAt: 'desc' },
          select: paymentSelect
      });
  }

  // create payment
  async createPaymentRecord(
    invoiceId: string,
    amount: Prisma.Decimal | number,
    paymentMethodId: number,
    transactionRef: string,
    status: PaymentStatus,
  ): Promise<PaymentResult> {
    const totalPaidDecimal = new Prisma.Decimal(amount);
    return this.prisma.payment.create({
      data: {
        invoiceId,
        totalPaid: totalPaidDecimal,
        paymentMethodId,
        transactionRef,
        status,
      },
      select: paymentSelect,
    });
  }
  
}