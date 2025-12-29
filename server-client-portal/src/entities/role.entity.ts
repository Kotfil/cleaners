import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { User } from './user.entity';
import { RolePermission } from './role-permission.entity';
import { Permission } from '../enums/permission.enum';

/**
 * Role entity for DYNAMIC role management
 * 
 * ⚠️ ВАЖНО: Roles динамические - создаются/редактируются через UI
 * - Полный CRUD через API: POST/PUT/DELETE /api/roles
 * - Назначение permissions: POST /api/roles/:id/permissions
 * - Permissions выбираются из фиксированного списка (31 шт)
 * 
 * Follows GRASP principles: Information Expert, Creator
 * Follows SOLID principles: Single Responsibility, Open/Closed
 */
@Entity('roles')
@Index(['name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsString()
  @MinLength(2)
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ default: false })
  @IsBoolean()
  @Exclude() // Скрываем поле из API ответов
  isDefault: boolean; // Роль по умолчанию для новых пользователей

  @Column({ default: false })
  @IsBoolean()
  isSystem: boolean; // Системная роль (admin, manager, cleaner) - нельзя удалить

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => User, user => user.role)
  users: User[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  @Exclude()
  rolePermissions: RolePermission[];

  // Virtual properties
  @Expose()
  get permissions(): Permission[] {
    // Возвращаем permissions из связи rolePermissions (безопасная обработка отсутствующих relations)
    try {
      if (!this.rolePermissions || !Array.isArray(this.rolePermissions) || this.rolePermissions.length === 0) {
        return [];
      }
      return this.rolePermissions
        .filter(rp => rp && rp.isValid)
        .map(rp => rp.permission?.name as Permission)
        .filter(Boolean);
    } catch (error) {
      // Если relations не загружены, возвращаем пустой массив
      return [];
    }
  }

  /**
   * Check if role has specific permission
   * @param permission - Permission to check
   * @returns boolean
   */
  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * Check if role has any of the provided permissions
   * @param permissions - Array of permissions to check
   * @returns boolean
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if role has all of the provided permissions
   * @param permissions - Array of permissions to check
   * @returns boolean
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Get permissions by resource
   * @param resource - Resource name (e.g., 'user', 'client')
   * @returns Array of permissions for the resource
   */
  getPermissionsByResource(resource: string): Permission[] {
    return this.permissions.filter(permission => 
      permission.startsWith(`${resource}:`)
    );
  }

  /**
   * Check if role has permission for specific resource and action
   * @param resource - Resource name
   * @param action - Action name
   * @returns boolean
   */
  hasResourcePermission(resource: string, action: string): boolean {
    const permissionName = `${resource}:${action}`;
    return this.permissions.includes(permissionName as Permission);
  }
}

