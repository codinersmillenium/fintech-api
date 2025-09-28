// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); 
  const port = configService.get<number>('APP_PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const apiVPrefix = configService.get<string>('API_VERSIONING_PREFIX') || 'v';
  const apiTitle = configService.get<string>('API_TITLE') || '';
  const apiDesc = configService.get<string>('API_DESCRIPTION') || '';
  const apiVersion = configService.get<string>('API_VERSION') || '1.0';

  app.setGlobalPrefix(apiPrefix);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true, 
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: apiVPrefix
  });
  app.use(bodyParser.json({
    verify: (req: any, res: any, buf: Buffer, encoding: string) => {
      if (req.originalUrl.includes('/webhook')) {
        req.rawBody = buf;
      }
      return true;
    },
    limit: '1mb', 
  }));
  app.use(bodyParser.urlencoded({ extended: true }));

  
  const configDocApi = new DocumentBuilder()
    .setTitle(apiTitle)
    .setDescription(apiDesc)
    .setVersion(apiVersion)
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'JWT Authentication',
    })
    .build();
  const document = SwaggerModule.createDocument(app, configDocApi);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  
  await app.listen(port);
  console.log(`running on ${await app.getUrl()}`);
  console.log(`Documentation available in ${await app.getUrl()}/${apiPrefix}/docs`);
}
bootstrap();