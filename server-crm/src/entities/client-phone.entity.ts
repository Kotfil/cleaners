import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, Length, IsBoolean } from 'class-validator';
import { Client } from './client.entity';

@Entity('client_phones')
export class ClientPhone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.phones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ length: 12 })
  @IsString()
  @Length(12, 12, { message: 'Phone number must be exactly 12 characters' })
  number: string; // Format: +1XXXXXXXXXX (E.164 format, 12 chars: + and 11 digits)

  @Column({ default: false })
  @IsBoolean()
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

