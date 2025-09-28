// src/modules/payments/dto/initiate-payment.dto.ts
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Invoice ID to be paid', example: "7f445bb7-2d02-477c-a2ec-5260cc8598a7" })
  @IsNotEmpty({ message: 'Invoice ID must not be empty.' })
  invoiceId: string;
}