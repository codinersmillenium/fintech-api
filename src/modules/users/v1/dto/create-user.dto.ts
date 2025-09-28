// src/modules/users/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'FullName' })
  @IsString()
  @IsNotEmpty()
  name: string; 

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string; 
}