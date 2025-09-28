// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config'; 

import { databaseConfig } from './config/database.config';         
import { jwtConfig } from './config/jwt.config';
import { webHookConfig } from './config/vendor.config';

import { UserModule } from './modules/users/user.module';           
import { CustomerModule } from './modules/customers/customer.module'; 
import { InvoiceModule } from './modules/invoices/invoice.module';    
import { PaymentModule } from './modules/payments/payment.module';    

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        jwtConfig,
        databaseConfig,
        webHookConfig
      ]
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: Number(process.env.THROTTLE_TTL) || 60000, 
          limit: Number(process.env.THROTTLE_LIMIT) || 100,
        },
      ],
    }),
    
    UserModule,
    CustomerModule,
    InvoiceModule,
    PaymentModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard }
  ],
})
export class AppModule {}