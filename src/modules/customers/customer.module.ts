// src/modules/customers/customer.module.ts
import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [
    CustomerService, 
    CustomerRepository
  ],
  exports: [ CustomerService ]
})
export class CustomerModule {}