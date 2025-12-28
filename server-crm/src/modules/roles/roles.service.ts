import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { PermissionEntity } from '../../entities/permission.entity';
import { User } from '../../entities/user.entity';
import { UserStatus } from '../../enums/user-status.enum';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

/**
 * RolesService - Business logic for role management
 * Follows GRASP principles: Information Expert, Creator, Controller
 * Follows SOLID principles: Single Responsibility, Open/Closed, Dependency Inversion
 */
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionsRepository: Repository<RolePermission>,
    @InjectRepository(PermissionEntity)
    private permissionsRepository: Repository<PermissionEntity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new role
   * @param createRoleDto - Role data
   * @returns Created role
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role with same name already exists
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name }
    });

    if (existingRole) {
      throw new BadRequestException(`Role with name '${createRoleDto.name}' already exists`);
    }

    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  /**
   * Get all roles with their permissions
   * @returns Array of roles with permissions loaded
   */
  async getAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['rolePermissions', 'rolePermissions.permission'],
      order: { name: 'ASC' }
    });
  }

  /**
   * Get role by ID with permissions
   * @param id - Role ID
   * @returns Role with permissions loaded
   */
  async getRoleById(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  /**
   * Update role
   * @param id - Role ID
   * @param updateRoleDto - Update data
   * @returns Updated role
   */
  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.getRoleById(id);

    // Защита роли Owner от изменений
    if (role.name.toLowerCase() === 'owner') {
      throw new BadRequestException(
        'Cannot modify owner role. Owner role is protected and cannot be changed.'
      );
    }

    // Check if role name already exists (if updating name)
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: updateRoleDto.name }
      });

      if (existingRole) {
        throw new BadRequestException(`Role with name '${updateRoleDto.name}' already exists`);
      }
    }

    // Обновляем только переданные поля
    if (updateRoleDto.name !== undefined) {
      role.name = updateRoleDto.name;
    }
    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description;
    }
    if (updateRoleDto.isDefault !== undefined) {
      role.isDefault = updateRoleDto.isDefault;
    }

    const savedRole = await this.rolesRepository.save(role);
    
    // Загружаем обновленную роль (без relations, чтобы избежать проблем с сериализацией)
    const updatedRole = await this.rolesRepository.findOne({
      where: { id: savedRole.id }
    });

    if (!updatedRole) {
      throw new NotFoundException(`Role with ID '${id}' not found after update`);
    }

    return updatedRole;
  }

  /**
   * Delete role
   * @param id - Role ID
   * @throws BadRequestException if role is a system role or assigned to users
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.getRoleById(id);

    // Защита роли Owner от удаления
    if (role.name.toLowerCase() === 'owner') {
      throw new BadRequestException(
        'Cannot delete owner role. Owner role is protected and cannot be deleted.'
      );
    }

    // Защита системных ролей от удаления
    if (role.isSystem) {
      throw new BadRequestException(
        `Cannot delete system role '${role.name}'. System roles (admin, manager, cleaner) are protected.`
      );
    }

    // Check if role is assigned to any users
    const userCount = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.roleId = :roleId', { roleId: id })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .getCount();

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.name}" because it is assigned to ${userCount} active user(s). ` +
        `Please reassign these users to a different role before deleting this role.`
      );
    }

    // Hard delete the role
    await this.rolesRepository.delete(id);
  }

  /**
   * Assign permissions to role
   * @param roleId - Role ID
   * @param assignPermissionsDto - Permission IDs
   */
  async assignPermissions(roleId: string, assignPermissionsDto: AssignPermissionsDto): Promise<void> {
    const role = await this.getRoleById(roleId);

    // Защита роли Owner от изменения permissions
    if (role.name.toLowerCase() === 'owner') {
      throw new BadRequestException(
        'Cannot modify permissions for owner role. Owner role has all permissions and cannot be changed.'
      );
    }

    // Validate all permission IDs exist (используем актуальный метод TypeORM)
    const permissions = await this.permissionsRepository.findBy({
      id: In(assignPermissionsDto.permissionIds)
    });
    
    if (permissions.length !== assignPermissionsDto.permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    // Защита: permissions role-management (create, read, update) доступны только для роли Owner
    const roleManagementPermissions = permissions.filter(
      p => p.resource === 'role-management' && ['create', 'read', 'update'].includes(p.action)
    );
    if (roleManagementPermissions.length > 0 && role.name.toLowerCase() !== 'owner') {
      const permissionNames = roleManagementPermissions.map(p => p.name).join(', ');
      throw new BadRequestException(
        `Permissions ${permissionNames} are only available for Owner role. Cannot assign them to other roles.`
      );
    }

    // Remove existing role permissions
    await this.rolePermissionsRepository.delete({ roleId });

    // Create new role permissions
    const rolePermissions = assignPermissionsDto.permissionIds.map(permissionId => 
      this.rolePermissionsRepository.create({ roleId, permissionId })
    );

    await this.rolePermissionsRepository.save(rolePermissions);
  }

  /**
   * Get users assigned to a specific role
   * @param roleId - Role ID
   * @returns Array of users with this role
   */
  async getUsersByRole(roleId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { roleId, status: UserStatus.ACTIVE },
      relations: ['phones'],
      select: ['id', 'email', 'name', 'avatar', 'createdAt'],
    });
  }

  /**
   * Get role counts (number of users per role)
   * @returns Object with role counts
   */
  async getRoleCounts(): Promise<Record<string, number>> {
    const counts = await this.rolesRepository
      .createQueryBuilder('role')
      .leftJoin('role.users', 'user')
      .select('role.name', 'roleName')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .groupBy('role.id, role.name')
      .getRawMany();

    const result: Record<string, number> = { all: 0 };
    
    counts.forEach(({ roleName, count }) => {
      result[roleName] = parseInt(count, 10);
      result.all += parseInt(count, 10);
    });

    return result;
  }

  /**
   * Get default role (обычно 'cleaner')
   * @returns Default role
   * @throws NotFoundException if no default role is set
   */
  async getDefaultRole(): Promise<Role> {
    // Ищем роль с флагом isDefault
    const defaultRole = await this.rolesRepository.findOne({
      where: { isDefault: true },
      order: { createdAt: 'ASC' },
    });

    if (!defaultRole) {
      // Fallback: ищем системную роль 'cleaner'
      const cleanerRole = await this.rolesRepository.findOne({
        where: { name: 'cleaner' },
      });

      if (!cleanerRole) {
        throw new NotFoundException(
          'No default role configured. Please run: yarn seed:permissions'
        );
      }

      return cleanerRole;
    }

    return defaultRole;
  }

  /**
   * Get role by name
   * @param name - Role name
   * @returns Role
   */
  async getRoleByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { name }
    });

    if (!role) {
      throw new NotFoundException(`Role with name '${name}' not found`);
    }

    return role;
  }
}
