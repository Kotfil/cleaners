import { IsString, Length, IsBoolean, IsOptional } from 'class-validator';

export class CreateClientPhoneDto {
  @IsString()
  @Length(12, 12, { message: 'Phone number must be exactly 12 characters' })
  number: string; // E.164 format: +1XXXXXXXXXX (USA: 12 chars total)

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

