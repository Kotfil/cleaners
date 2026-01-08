import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserPhone } from '../entities/user-phone.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';

/**
 * Database configuration for client portal
 * Connects to shared database from server-crm
 */
export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', ''),
  password: configService.get<string>('DB_PASSWORD', ''),
  database: configService.get<string>('DB_DATABASE', ''),
  entities: [User, UserPhone, PermissionEntity, Role, RolePermission],
  synchronize: false, // Disabled - use migrations from server-crm
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
});

