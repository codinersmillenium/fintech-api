// src/modules/users/users.service.ts
import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './v1/dto/create-user.dto';
import { UserRepository } from './user.repository';
import { CustomerService } from '../customers/customer.service'; 
import { GeneralUserResult, AuthUserResult } from './user.type'; 

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository, 
    private readonly jwtService: JwtService,
  ) {}

  // register user
  async register(payload: CreateUserDto): Promise<GeneralUserResult> {
    const exists = await this.userRepository.findByEmailForAuth(payload.email); 
    if (exists) {
      throw new ConflictException('Email already registered');
    }
    const userResult = await this.userRepository.create(payload);
    return userResult;
  }

  async findAll(): Promise<GeneralUserResult[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: string): Promise<GeneralUserResult> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // validate user (private)
  async validateUser(email: string, pass: string): Promise<Omit<AuthUserResult, 'password'> | null> {
    const authResult = await this.userRepository.findByEmailForAuth(email); 
    
    if (!authResult) return null;
    const match = await bcrypt.compare(pass, authResult.password); 
    if (!match) return null;

    const { password, ...safe } = authResult; 
    return safe; 
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.validateUser(email, password); 
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id }; 
    
    return { access_token: this.jwtService.sign(payload) };
  }
}