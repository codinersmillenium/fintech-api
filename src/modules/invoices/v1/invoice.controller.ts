// src/modules/invoices/invoice.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceService } from '../invoice.service';

@ApiTags('invoices (v1)')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller({
  path: 'invoices',
  version: '1',
})
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // create invoice
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(createInvoiceDto);
  }

  // get detail invoice
  @Get(':invoiceId')
  async getDetail(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.getInvoiceDetail(invoiceId);
  }
}
