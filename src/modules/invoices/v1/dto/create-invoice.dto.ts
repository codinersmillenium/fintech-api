// src/modules/invoices/dto/create-invoice.dto.ts
import { IsNumber, Min, IsNotEmpty, IsUUID, IsArray, ArrayMinSize, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateInvoiceItemDto {
  @ApiProperty({ description: 'ID of the purchased product (must be a positive integer)', example: 101 })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  productId: number;

  @ApiProperty({ description: 'Quantity of the purchased product', example: 5 })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  quantity: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'ID of the customer who owns this invoice (UUID)', example: 'f3a4b5c6-d7e8-11e9-963d-06830501a4e1' })
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  // @ApiProperty({ 
  //   description: 'Invoice due date (ISO 8601 format, optional)', 
  //   example: '2025-12-31T23:59:59Z',
  //   required: false
  // })
  // @IsDateString()
  // dueDate?: string;

  @ApiProperty({ 
    description: 'List of product items included in the invoice', 
    type: [CreateInvoiceItemDto] 
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}

export class InvoiceIdDto {
  @ApiProperty({ description: 'Invoice ID (UUID)', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsUUID()
  invoiceId: string;
}