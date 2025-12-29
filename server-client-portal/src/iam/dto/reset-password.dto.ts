import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO for reset password request
 */
export class ResetPasswordDto {
  @IsString()
  token: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(25, { message: 'Password must not exceed 25 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  password: string;

  @MinLength(6, { message: 'Confirm password must be at least 6 characters long' })
  @MaxLength(25, { message: 'Confirm password must not exceed 25 characters' })
  confirmPassword: string;
}

