import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for inviting client to sign up
 */
export class InviteClientDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string; // Should be 'client'
}

