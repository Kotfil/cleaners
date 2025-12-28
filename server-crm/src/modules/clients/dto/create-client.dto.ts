import { IsEmail, IsOptional, IsString, MinLength, MaxLength, ValidateNested, ArrayMaxSize, ArrayMinSize, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateClientPhoneDto } from './create-client-phone.dto';
import { ClientStatus } from '../../../enums/client-status.enum';

export class CreateClientDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(80)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(70)
  name?: string;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;

  @IsOptional()
  @IsBoolean()
  canSignIn?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateClientPhoneDto)
  @ArrayMaxSize(10, { message: 'Maximum 10 phone numbers allowed' })
  @ArrayMinSize(1, { message: 'At least one phone number is required' })
  phones?: CreateClientPhoneDto[];

  // Preferred normalized field
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  apt?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  formattedAddress?: string;

  @IsOptional()
  @IsString()
  placeId?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}
