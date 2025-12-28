import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsBoolean, ValidateIf, ValidateNested, ArrayMaxSize, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserPhoneDto } from '../../modules/users/dto/create-user-phone.dto';

export class SignUpDto {
  @IsEmail()
  email: string;

  @ValidateIf((o) => o.canSignIn !== false)
  @MinLength(8, { message: 'Password is required and must be at least 8 characters when canSignIn is true' })
  @IsString()
  password?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  name?: string;

  @IsString()
  @IsNotEmpty()
  role: string; // Primary role

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  secondaryRoles?: string[]; // Secondary roles (optional array)

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateUserPhoneDto)
  @ArrayMaxSize(10, { message: 'Maximum 10 phone numbers allowed' })
  phones?: CreateUserPhoneDto[];

  @IsString()
  @IsOptional()
  phone?: string; // Deprecated, use phones instead

  @IsBoolean()
  @IsOptional()
  canSignIn?: boolean;

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
  notes?: string;
}
