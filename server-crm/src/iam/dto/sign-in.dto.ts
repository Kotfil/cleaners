import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(25, { message: 'Password must not exceed 25 characters' })
  password: string;

  @IsOptional()
  @IsString()
  captcha?: string;
}
