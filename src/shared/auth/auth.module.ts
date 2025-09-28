// src/shared/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('jwt.secret'),
            signOptions: { 
                expiresIn: configService.get<string>('jwt.expiresIn') || '1h' 
            },
        }),
        inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard], 
})
export class SharedAuthModule {}