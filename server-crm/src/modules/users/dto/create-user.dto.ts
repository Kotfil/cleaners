import { IsEmail, IsOptional, IsString, MinLength, MaxLength, ValidateNested, ArrayMaxSize, IsUUID, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserPhoneDto } from './create-user-phone.dto';
import { UserStatus } from '../../../enums/user-status.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  name?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsUUID()
  roleId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  secondaryRoleIds?: string[];

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateUserPhoneDto)
  @ArrayMaxSize(10, { message: 'Maximum 10 phone numbers allowed' })
  phones?: CreateUserPhoneDto[];

  // Address fields
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
  avatar?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  canSignIn?: boolean;
}

