import { IsString, IsOptional, MinLength } from 'class-validator';

/**
 * DTO for creating a new role
 * Follows SOLID principles: Single Responsibility
 */
export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
