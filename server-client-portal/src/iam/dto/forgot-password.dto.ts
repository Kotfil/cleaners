import { IsEmail } from 'class-validator';

/**
 * DTO for forgot password request
 */
export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

