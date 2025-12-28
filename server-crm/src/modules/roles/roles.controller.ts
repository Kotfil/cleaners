import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { Permissions } from '../../iam/authorization/decorators/permissions.decorator';
import { Permission } from '../../enums/permission.enum';
import { Public } from 'src/iam/decorators/public.decorator';

/**
 * RolesController - API endpoints for role management
 * Follows GRASP principles: Controller
 * Follows SOLID principles: Single Responsibility, Interface Segregation
 */
@Controller('roles')
@UseInterceptors(ClassSerializerInterceptor)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Create a new role
   * @param createRoleDto - Role data
   * @returns Created role
   */
  @Post()
  @Public()
  // @Permissions(Permission.USER_CREATE)
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createRole(createRoleDto);
  }

  /**
   * Get all roles
   * @returns Array of roles
   */
  @Get()
  @Public()
  // @Permissions(Permission.USER_READ)
  async getAllRoles(): Promise<Role[]> {
    return this.rolesService.getAllRoles();
  }

  /**
   * Get role counts (number of users per role)
   * @returns Object with role counts
   */
  @Get('counts')
  @Public()
  // @Permissions(Permission.USER_READ)
  async getRoleCounts(): Promise<Record<string, number>> {
    return this.rolesService.getRoleCounts();
  }

  /**
   * Get role by ID
   * @param id - Role ID
   * @returns Role
   */
  @Get(':id')
  @Public()
  // @Permissions(Permission.USER_READ)
  async getRoleById(@Param('id') id: string): Promise<Role> {
    return this.rolesService.getRoleById(id);
  }

  /**
   * Update role
   * @param id - Role ID
   * @param updateRoleDto - Update data
   * @returns Updated role
   */
  @Put(':id')
  @Public()
  // @Permissions(Permission.USER_UPDATE)
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<Role> {
    try {
      return await this.rolesService.updateRole(id, updateRoleDto);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete role
   * @param id - Role ID
   */
  @Delete(':id')
  @Public()
  // @Permissions(Permission.USER_DELETE)
  async deleteRole(@Param('id') id: string): Promise<void> {
    return this.rolesService.deleteRole(id);
  }

  /**
   * Assign permissions to role
   * @param id - Role ID
   * @param assignPermissionsDto - Permission IDs
   */
  @Post(':id/permissions')
  @Public()
  // @Permissions(Permission.USER_UPDATE)
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto
  ): Promise<void> {
    return this.rolesService.assignPermissions(id, assignPermissionsDto);
  }

  /**
   * Get users assigned to a specific role
   * @param id - Role ID
   * @returns Array of users with this role
   */
  @Get(':id/users')
  @Public()
  // @Permissions(Permission.USER_READ)
  async getUsersByRole(@Param('id') id: string): Promise<User[]> {
    return this.rolesService.getUsersByRole(id);
  }
}
