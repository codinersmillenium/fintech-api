// src/modules/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { 
  generalSelect, 
  GeneralUserResult, 
  authSelect, 
  AuthUserResult 
} from './user.type'; 
import { CreateUserDto } from './v1/dto/create-user.dto';


@Injectable()
export class UserRepository {  
  constructor(private readonly prisma: PrismaService) {} 

  // create user
  async create(payload: CreateUserDto): Promise<GeneralUserResult> {
    const hashed = await bcrypt.hash(payload.password, 10);
    const userResult: GeneralUserResult = await this.prisma.user.create({
      data: { 
        email: payload.email, 
        password: hashed,
        customer: { 
            create: {
                name: payload.name,
                phone: payload.phone
            }
        }
      },
      select: generalSelect
    });
    
    return userResult;
}

  // find by id
  async findById(id: string): Promise<GeneralUserResult | null> {
    const rec: GeneralUserResult | null = await this.prisma.user.findUnique({
      where: { id },
      select: generalSelect
    });
    return rec; 
  }

  // find by email
  async findByEmailForAuth(email: string): Promise<AuthUserResult | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: authSelect,
    }) as Promise<AuthUserResult | null>;
  }

  // find all user
  async findAll(): Promise<GeneralUserResult[]> {
    const recs: GeneralUserResult[] = await this.prisma.user.findMany({
      select: generalSelect
    });
    return recs;
  }
}