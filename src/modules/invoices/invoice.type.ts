// src/modules/invoices/invoice.type.ts
import { Prisma } from '@prisma/client';
import { paymentSelect } from '../payments/payment.type';

export interface CreateInvoiceItemPayload {
  productId: number;
  quantity: number;
  unitPrice: Prisma.Decimal;
  amount: Prisma.Decimal;
}

export const invoiceItemSelect = {
  id: true,
  productId: true,
  quantity: true,
  unitPrice: true,
  product: {
    select: {
      name: true,
      price: true,
    },
  },
} as const;

export const invoiceBaseSelect = {
  id: true,
  customerId: true,
  status: true,
  amount: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const invoiceDetailSelect = {
  ...invoiceBaseSelect,
  items: {
    select: invoiceItemSelect,
  },
  payment: {
    select: paymentSelect,
  },
  customer: {
    select: { name: true, phone: true },
  },
} as const;

// type payload
export type InvoiceBaseResult = Prisma.InvoiceGetPayload<{ select: typeof invoiceBaseSelect }>;
export type InvoiceDetailResult = Prisma.InvoiceGetPayload<{ select: typeof invoiceDetailSelect }>;