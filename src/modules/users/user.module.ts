// src/modules/users/user.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SharedAuthModule } from '../../shared/auth/auth.module';
import { CustomerModule } from '../customers/customer.module';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserControllerV1 } from './v1/user.controller';

@Module({
  imports: [
    PrismaModule,
    CustomerModule, 
    SharedAuthModule
  ],
  controllers: [UserControllerV1],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}