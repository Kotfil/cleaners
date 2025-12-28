import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(3)
  name: string; // 'user:create', 'client:read', etc.

  @IsString()
  @MinLength(5)
  description: string;

  @IsString()
  @MinLength(2)
  resource: string; // 'user', 'client', 'order', 'calendar', 'finance', 'reports', 'settings'

  @IsString()
  @MinLength(2)
  action: string; // 'create', 'read', 'update', 'delete'

  @IsOptional()
  @IsString()
  notes?: string;
}
