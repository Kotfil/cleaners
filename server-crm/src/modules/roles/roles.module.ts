import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from '../../entities/role.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { PermissionEntity } from '../../entities/permission.entity';
import { User } from '../../entities/user.entity';

/**
 * RolesModule - Module for role management
 * Follows GRASP principles: Creator
 * Follows SOLID principles: Single Responsibility, Dependency Inversion
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RolePermission, PermissionEntity, User])
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // Export service for use in other modules
})
export class RolesModule {}
