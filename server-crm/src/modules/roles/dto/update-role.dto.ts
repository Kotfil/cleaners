import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

/**
 * DTO for updating a role
 * Follows SOLID principles: Single Responsibility
 */
export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
