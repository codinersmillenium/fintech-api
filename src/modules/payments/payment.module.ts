// src/modules/payments/payment.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeMockModule } from '../../shared/stripe-mock/stripe-mock.module';
import { SharedAuthModule } from '../../shared/auth/auth.module';
import { InvoiceModule } from '../invoices/invoice.module';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PaymentController } from './v1/payment.controller';

@Module({
  imports: [
    PrismaModule, 
    StripeMockModule,
    InvoiceModule,
    SharedAuthModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService],
})
export class PaymentModule {}