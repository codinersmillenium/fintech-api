// src/shared/stripe-mock/stripe-mock.module.ts
import { Module } from '@nestjs/common';
import { StripeMockService } from './stripe-mock.service';

@Module({
  providers: [StripeMockService],
  exports: [StripeMockService],
})
export class StripeMockModule {}