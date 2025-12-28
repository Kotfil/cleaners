import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { databaseConfig } from './config/database.config';
import { User } from './entities/user.entity';
import { UserPhone } from './entities/user-phone.entity';
import { Client } from './entities/client.entity';
import { ClientPhone } from './entities/client-phone.entity';
import { PermissionEntity } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { IamModule } from './iam/iam.module';
import { GeoModule } from './modules/geo/geo.module';
import { RingCentralModule } from './modules/ring-central/ring-central.module';

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
    TypeOrmModule.forFeature([User, UserPhone, Client, ClientPhone, PermissionEntity, Role, RolePermission]),
    UsersModule,
    ClientsModule,
    PermissionsModule,
    RolesModule,
    IamModule,
    GeoModule,
    RingCentralModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
