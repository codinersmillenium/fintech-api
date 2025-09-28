// src/modules/payments/dto/payments.dto.ts
import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PaymentRequestDto {
  @ApiProperty({ 
    description: 'Invoice ID to be processed for payment', 
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' 
  })
  @IsNotEmpty()
  @IsString()
  invoiceId: string;
}
