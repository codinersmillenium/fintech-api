// src/modules/payments/product.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductRepository } from './product.repository';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [
    ProductRepository
  ],
  exports: [ ProductRepository ]
})
export class ProductModule {}