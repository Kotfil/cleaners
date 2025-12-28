import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';

import { User } from '../entities/user.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { RecaptchaService } from './recaptcha/recaptcha.service';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { PermissionsGuard, RolesGuard } from './authorization';
import { UsersModule } from '../modules/users/users.module';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PermissionEntity, Role]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        audience: configService.get<string>('JWT_TOKEN_AUDIENCE'),
        issuer: configService.get<string>('JWT_TOKEN_ISSUER'),
        // Не указываем expiresIn здесь - он будет в signToken методе
      }),
    }),
    ConfigModule.forFeature(jwtConfig),
    HttpModule,
    RedisModule,
    EmailModule,
    UsersModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    RecaptchaService,
    AccessTokenGuard,
    AuthenticationGuard,
    PermissionsGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [
    AuthenticationService,
    AccessTokenGuard,
    AuthenticationGuard,
    PermissionsGuard,
    RolesGuard,
  ],
})
export class IamModule {}
