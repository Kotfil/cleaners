import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserPhone } from '../entities/user-phone.entity';
import { Client } from '../entities/client.entity';
import { ClientPhone } from '../entities/client-phone.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';

const isSsl = process.env.DB_SSL === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'cleaners',
  password: process.env.DB_PASSWORD || 'cleaners',
  database: process.env.DB_DATABASE || 'cleaners',
  entities: [User, UserPhone, Client, ClientPhone, PermissionEntity, Role, RolePermission],
  migrations: ['src/migrations/*.ts'],
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});


