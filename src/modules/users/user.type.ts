// src/modules/users/user.types.ts
import { Prisma } from '@prisma/client';

export const generalSelect = { 
  id: true, 
  email: true, 
  createdAt: true,
  updatedAt: true,
  customer: {
    select: { id: true, name: true, phone: true }
  }
} as const;

export const authSelect = {
  id: true,
  email: true,
  password: true
} as const;

export type GeneralUserResult = Prisma.UserGetPayload<{ select: typeof generalSelect }>; 
export type AuthUserResult = Prisma.UserGetPayload<{ select: typeof authSelect }>;