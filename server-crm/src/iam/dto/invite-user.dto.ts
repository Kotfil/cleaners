import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for inviting user to sign up
 */
export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

