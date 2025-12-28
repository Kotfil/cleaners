import {Controller, Get, Param} from '@nestjs/common';
import {PermissionsService} from './permissions.service';
import {Public} from 'src/iam/decorators/public.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Get all permissions (READ ONLY - permissions are static, created via seed)
   * Permissions создаются только через seed: yarn seed:permissions
   */
  @Get()
  @Public()
  // @Permissions(Permission.USER_READ)
  async getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  /**
   * Get route-to-permission mappings (для динамической проверки доступа к страницам)
   * Возвращает map: { '/users': ['user:read'], '/role-management': ['user:create'], ... }
   */
  @Get('route-mappings')
  @Public()
  async getRouteMappings() {
    return this.permissionsService.getRouteMappings();
  }

  /**
   * Get permissions by resource
   */
  @Get('resource/:resource')
  @Public()
  // @Permissions(Permission.USER_READ)
  async getPermissionsByResource(@Param('resource') resource: string) {
    return this.permissionsService.getPermissionsByResource(resource);
  }

}
