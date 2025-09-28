// src/modules/invoices/invoice.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, InvoiceStatus } from '@prisma/client';
import { 
    InvoiceDetailResult, 
    InvoiceBaseResult, 
    CreateInvoiceItemPayload
} from './invoice.type';
import { CreateInvoiceDto, CreateInvoiceItemDto } from './v1/dto/create-invoice.dto';
import { InvoiceRepository } from './invoice.repository';
import { ProductRepository } from '../products/product.repository';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  private calculateOverallTotal(items: CreateInvoiceItemPayload[]): Prisma.Decimal {
    return items.reduce(
      (acc, item) => acc.add(item.amount), 
      new Prisma.Decimal(0) 
    );
  }

  async createInvoice(payload: CreateInvoiceDto): Promise<InvoiceDetailResult> {
    const productIds: number[] = payload.items.map(item => item.productId);
    const productPricesMap = await this.productRepository.getPricesByIds(productIds); 
    if (productPricesMap.size !== productIds.length) {
      const foundIds = Array.from(productPricesMap.keys());
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      if (missingIds.length > 0) {
        throw new BadRequestException(`Price for the following product IDs was not found or inactive: ${missingIds.join(', ')}`);
      }
    }

    const calculatedItemPayload: CreateInvoiceItemPayload[] = payload.items.map(item => {
      const unitPrice = productPricesMap.get(item.productId); 
      
      if (!unitPrice) {
        throw new BadRequestException(`Product with ID ${item.productId} was not found.`);
      }
      
      // check qty
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new BadRequestException(`Quantity for product ${item.productId} must be a positive number.`);
      }

      const qtyDecimal = new Prisma.Decimal(item.quantity);
      const totalAmount = unitPrice.mul(qtyDecimal); 

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice,       
        amount: totalAmount,   
      } as CreateInvoiceItemPayload;
    });

    const overallTotalAmount = this.calculateOverallTotal(calculatedItemPayload);
    if (overallTotalAmount.isZero() || overallTotalAmount.isNegative()) {
      throw new BadRequestException('Invoice must have a positive total amount after calculation.');
    }

    // clean result
    const repositoryItemPayload = calculatedItemPayload.map(item => {
      const { amount, ...rest } = item;
      return rest;
    });

    // create invoice
    return this.invoiceRepository.createInvoice(
      payload.customerId,
      repositoryItemPayload as any,
      overallTotalAmount, 
    );
  }

  // update status invoice
  async updateStatusFromPayment(invoiceId: string, status: InvoiceStatus): Promise<InvoiceBaseResult> {
    const invoice = await this.invoiceRepository.findDetailById(invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} was not found.`);
    }
    return this.invoiceRepository.updateStatus(invoiceId, status);
  }

  // get invoice detail
  async getInvoiceDetail(invoiceId: string): Promise<InvoiceDetailResult> {
    const invoice = await this.invoiceRepository.findDetailById(invoiceId);
    if (!invoice) throw new NotFoundException('Invoice detail was not found.');
    return invoice;
  }
}