import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { databaseConfig } from './config/database.config';
import { User } from './entities/user.entity';
import { UserPhone } from './entities/user-phone.entity';
import { PermissionEntity } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { IamModule } from './iam/iam.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * App Module for client portal
 * Uses shared database from server-crm
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'], // Проверяем .env в текущей директории и в корне проекта
      expandVariables: true, // Разрешаем использование переменных в .env
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 50, // 50 requests per minute (default for all endpoints)
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserPhone, PermissionEntity, Role, RolePermission]),
    IamModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
