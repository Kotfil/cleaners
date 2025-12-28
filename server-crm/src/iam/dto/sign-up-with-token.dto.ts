import { IsString, MinLength, MaxLength, IsNotEmpty, IsEmail, IsOptional, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserPhoneDto } from '../../modules/users/dto/create-user-phone.dto';

/**
 * DTO for sign up with invitation token
 */
export class SignUpWithTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  name?: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsString()
  password: string;

  @MinLength(8, { message: 'Confirm password must be at least 8 characters long' })
  @IsString()
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateUserPhoneDto)
  @ArrayMaxSize(10, { message: 'Maximum 10 phone numbers allowed' })
  phones?: CreateUserPhoneDto[];
}

