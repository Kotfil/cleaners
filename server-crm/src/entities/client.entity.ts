import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsOptional, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { ClientPhone } from './client-phone.entity';
import { ClientStatus } from '../enums/client-status.enum';

@Entity('clients')
@Index(['email'], { unique: true, where: '"status" != \'archived\'' })
@Index('idx_clients_created_at', ['createdAt'])
@Index('idx_clients_status_created_at', ['status', 'createdAt'])
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true, length: 80 })
  @IsOptional()
  @IsEmail()
  @MaxLength(80)
  email?: string;

  @Column({ nullable: true, length: 70 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(70)
  name?: string;

  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.ACTIVE })
  @IsEnum(ClientStatus)
  status: ClientStatus;

  @Column({ default: false })
  canSignIn: boolean; // Can client sign in to client portal

  @OneToMany(() => ClientPhone, (phone) => phone.client, { cascade: true, eager: false })
  phones?: ClientPhone[];

  // Removed legacy combined address field

  // Normalized address fields
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

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  // Helper method to get full address
  get fullAddress(): string {
    const base = this.formattedAddress || undefined;
    if (base) return base;
    const parts = [this.street, this.city, this.state, this.zipCode]
      .filter(Boolean);
    return parts.join(', ');
  }

  // Helper method to get primary phone
  get primaryPhone(): ClientPhone | undefined {
    return this.phones?.find(phone => phone.isPrimary) || this.phones?.[0];
  }

  // Helper method to check if client has complete contact info
  get hasCompleteContactInfo(): boolean {
    return !!(this.phones && this.phones.length > 0);
  }

  // Helper method to check if client is active
  get isActive(): boolean {
    return this.status === ClientStatus.ACTIVE;
  }

  // Helper method to check if client is suspended
  get isSuspended(): boolean {
    return this.status === ClientStatus.SUSPENDED;
  }

  // Helper method to check if client is archived
  get isArchived(): boolean {
    return this.status === ClientStatus.ARCHIVED;
  }
}
