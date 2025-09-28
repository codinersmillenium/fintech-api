// src/modules/invoices/invoice.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SharedAuthModule } from '../../shared/auth/auth.module';
import { ProductModule } from '../products/product.module';
import { InvoiceController } from './v1/invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';

@Module({
  imports: [
    PrismaModule, 
    SharedAuthModule,
    ProductModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository],
  exports: [InvoiceService, InvoiceRepository],
})
export class InvoiceModule {}