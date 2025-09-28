// src/modules/products/product.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}
    async getPricesByIds(ids: number[]): Promise<Map<number, Prisma.Decimal>> {
      const products = await this.prisma.productSample.findMany({
        where: {
          id: {
            in: ids,
          },
          isDeleted: false,
        },
        select: {
          id: true,
          price: true,
        },
      });
    const priceMap = new Map<number, Prisma.Decimal>();
    products.forEach(p => {
      priceMap.set(p.id, p.price);
    });

    return priceMap;
  }
}