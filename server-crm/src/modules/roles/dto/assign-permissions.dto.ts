import { IsArray, IsUUID } from 'class-validator';

/**
 * DTO for assigning permissions to a role
 * Follows SOLID principles: Single Responsibility
 */
export class AssignPermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
