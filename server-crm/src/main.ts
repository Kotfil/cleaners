import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { resolve } from 'path';
import { appConfig } from './config/app.config';

// Загружаем .env файл из корня проекта или из server/
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') }); // Fallback для корня проекта

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Добавляем cookie parser middleware
  app.use(cookieParser());
  
  // Настройка CORS
  app.enableCors({
    origin: appConfig.cors.origins,
    credentials: true, // Важно для cookies и авторизации
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });
  
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
