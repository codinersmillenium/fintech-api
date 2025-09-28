// src/modules/payments/payment.type.ts
import { Prisma } from '@prisma/client';

export const paymentSelect = {
  id: true,
  invoiceId: true,
  totalPaid: true,
  status: true,
  transactionRef: true,
  paymentMethod: {
    select: {
      method: true,
    },
  },
} as const;

export type PaymentResult = Prisma.PaymentGetPayload<{ select: typeof paymentSelect }>;