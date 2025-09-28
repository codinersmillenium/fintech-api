// src/modules/customers/v1/customer.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Customer } from '@prisma/client'; 

const generalSelect = {
  select: {
    id: true,
    userId: true,
    name: true,
    phone: true,
    isDeleted: true,
    createdAt: true,
    updatedAt: true,
  },
};

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; name: string; phone?: string }): Promise<Customer | null> {
    const rec: Customer = await this.prisma.customer.create({
      data: {
        userId: data.userId,
        name: data.name,
        phone: data.phone,
      },
      ...generalSelect,
    });
    return rec;
  }
}