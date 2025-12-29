import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from '../enums/permission.enum';
import { UserStatus } from '../enums/user-status.enum';
import { Role } from './role.entity';
import { UserPhone } from './user-phone.entity';

@Entity('users')
@Index(['email'], { unique: true, where: '"status" != \'archived\'' })
@Index('idx_users_created_at', ['createdAt'])
@Index('idx_users_status_created_at', ['status', 'createdAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true, length: 30 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name?: string;

  @Column()
  @IsString()
  @MinLength(8)
  password: string;

  @Column()
  @IsUUID()
  roleId: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status: UserStatus;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  deletedEmail?: string;

  @Column({ default: true })
  canSignIn: boolean;

  @OneToMany(() => UserPhone, (phone) => phone.user, { cascade: true, eager: false })
  phones?: UserPhone[];

  // Address fields (same as clients)
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  street?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  apt?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @Column({ nullable: true, length: 2 })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  formattedAddress?: string;

  @Index()
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  placeId?: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'users_secondary_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  secondaryRoles?: Role[];

  // Virtual property for permissions based on primary role and secondary roles (merged without duplicates)
  get permissions(): Permission[] {
    const primaryPermissions = this.role?.permissions || [];
    const secondaryPermissions = (this.secondaryRoles || [])
      .flatMap(role => role?.permissions || []);
    // Объединяем permissions из всех ролей в Set для исключения дубликатов
    return Array.from(new Set([...primaryPermissions, ...secondaryPermissions]));
  }

  // Helper method to check if user has specific permission
  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }

  // Helper method to check if user has any of the provided permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Helper method to check if user has all of the provided permissions
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Helper method to get user's full name (alias for name)
  get fullName(): string | undefined {
    return this.name;
  }

  // Helper method to get role name (primary role)
  get roleName(): string {
    return this.role?.name || ''; // Role is required, but safe fallback if not loaded in relations
  }

  // Helper method to get secondary role names
  get secondaryRoleNames(): string[] {
    return (this.secondaryRoles || []).map(role => role?.name).filter(Boolean) as string[];
  }

  // Helper method to get all role names (primary + secondary)
  get allRoleNames(): string[] {
    const roles = [this.role?.name].filter(Boolean) as string[];
    const secondaryNames = (this.secondaryRoles || []).map(role => role?.name).filter(Boolean) as string[];
    return [...roles, ...secondaryNames];
  }

  // Helper method to check if user is manager
  get isManager(): boolean {
    return this.role?.name === 'manager';
  }

  // Helper method to check if user is cleaner
  get isCleaner(): boolean {
    return this.role?.name === 'cleaner';
  }

  // Helper method to check if user is admin
  get isAdmin(): boolean {
    return this.role?.name === 'admin';
  }

  // Helper method to get permissions by resource
  getPermissionsByResource(resource: string): Permission[] {
    return this.permissions.filter(permission => 
      permission.startsWith(`${resource}:`)
    );
  }

  // Helper method to check if user has permission for specific resource and action
  hasResourcePermission(resource: string, action: string): boolean {
    const permissionName = `${resource}:${action}`;
    return this.permissions.includes(permissionName as Permission);
  }

  // Helper method to check if user has a password set
  get hasPassword(): boolean {
    return !!this.password && this.password.trim().length > 0;
  }

  // Helper method to check if user is active
  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  // Helper method to check if user is suspended
  get isSuspended(): boolean {
    return this.status === UserStatus.SUSPENDED;
  }

  // Helper method to check if user is archived
  get isArchived(): boolean {
    return this.status === UserStatus.ARCHIVED;
  }

  // Helper method to get full address
  get fullAddress(): string {
    const base = this.formattedAddress || undefined;
    if (base) return base;
    const parts = [this.street, this.city, this.state, this.zipCode]
      .filter(Boolean);
    return parts.join(', ');
  }

  // Helper method to get primary phone
  get primaryPhone(): UserPhone | undefined {
    return this.phones?.find(phone => phone.isPrimary) || this.phones?.[0];
  }
}

