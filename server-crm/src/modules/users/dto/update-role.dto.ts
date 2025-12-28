import { IsString, MinLength } from 'class-validator';

/**
 * DTO for updating user role
 */
export class UpdateRoleDto {
  @IsString()
  @MinLength(2)
  role: string;
}

