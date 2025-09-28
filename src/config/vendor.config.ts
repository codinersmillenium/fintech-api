// src/config/vendor.config.ts
import { registerAs } from '@nestjs/config';

export const webHookConfig = registerAs('webhook', () => ({
  provider: process.env.WEBHOOK_PROVIDER,
  secret_key: process.env.WEBHOOK_SECRET_KEY,
  sign_key: process.env.WEBHOOK_SIGN_KEY,
  stripe_success_url: process.env.WEBHOOK_CALLBACK_URL + '?status=success',
  stripe_cancel_url: process.env.WEBHOOK_CALLBACK_URL + '?status=failed',
}));