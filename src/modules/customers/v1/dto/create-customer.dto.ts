// src/modules/customers/v1/create-customer.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;
}