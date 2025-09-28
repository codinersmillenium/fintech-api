// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,  
  expiresIn: process.env.JWT_EXPIRATION_TIME || '60m', 
}));