import {Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';
import {IsOptional, IsString, MinLength} from 'class-validator';
import {RolePermission} from './role-permission.entity';

@Entity('permissions')
@Index(['name'], { unique: true })
@Index(['resource', 'action'])
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsString()
  @MinLength(3)
  name: string; // 'user:create', 'client:read', etc.

  @Column()
  @IsString()
  @MinLength(5)
  description: string;

  @Column()
  @IsString()
  @MinLength(2)
  resource: string; // 'user', 'client', 'order', 'calendar', 'finance', 'reports', 'settings'

  @Column()
  @IsString()
  @MinLength(2)
  action: string; // 'create', 'read', 'update', 'delete'

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  routes?: string[]; // URLs связанные с этим permission, например: ['/users', '/clients']

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions: RolePermission[];

}
