import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from '../../constants';
import { Permission } from '../../../enums/permission.enum';
import { PERMISSIONS_KEY } from '../decorators';

/**
 * PermissionsGuard - проверяет наличие требуемых permissions у пользователя
 * 
 * Если на эндпоинте указан @Permissions(Permission.CLIENT_READ), 
 * guard проверяет что у пользователя есть этот permission в JWT токене
 * 
 * Follows SOLID: Single Responsibility
 * Follows GRASP: Information Expert (использует permissions из JWT)
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если permissions не указаны - разрешаем доступ
    if (!contextPermissions || contextPermissions.length === 0) {
      return true;
    }

    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Проверяем что у пользователя есть все требуемые permissions
    const hasAllPermissions = contextPermissions.every((permission) =>
      user.permissions?.includes(permission),
    );

    if (!hasAllPermissions) {
      const missingPermissions = contextPermissions.filter(
        (permission) => !user.permissions?.includes(permission)
      );
      throw new ForbiddenException(
        `Missing required permissions: ${missingPermissions.join(', ')}`
      );
    }

    return true;
  }
}
