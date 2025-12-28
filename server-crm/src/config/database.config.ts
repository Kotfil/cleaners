import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserPhone } from '../entities/user-phone.entity';
import { Client } from '../entities/client.entity';
import { ClientPhone } from '../entities/client-phone.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'cleaners'),
  password: configService.get<string>('DB_PASSWORD', 'cleaners'),
  database: configService.get<string>('DB_DATABASE', 'cleaners'),
  entities: [User, UserPhone, Client, ClientPhone, PermissionEntity, Role, RolePermission],
  synchronize: false, // Disabled - use migrations instead
  logging: configService.get<string>('NODE_ENV') === 'development',
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
});
