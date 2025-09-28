// src/modules/customers/v1/customer.service.ts
import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client'; 
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto } from './v1/dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}

  // register customer
  async registerCustomer(dto: CreateCustomerDto): Promise<Customer | null> {
    return this.repository.create({
      userId: dto.userId,
      name: dto.name,
      phone: dto.phone,
    });
  }
  
}