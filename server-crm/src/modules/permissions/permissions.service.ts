import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>,
  ) {}

  /**
   * Create a new permission
   */
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<PermissionEntity> {
    const { name, description, resource, action } = createPermissionDto;

    // Check if permission already exists
    const existingPermission = await this.permissionsRepository.findOne({
      where: { name },
    });

    if (existingPermission) {
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionsRepository.create({
      name,
      description,
      resource,
      action,
    });

    return this.permissionsRepository.save(permission);
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionsRepository.find({
      where: { isActive: true },
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  /**
   * Get route-to-permission mappings
   * Возвращает объект { route: [permissions] } для динамической проверки доступа к страницам
   */
  async getRouteMappings(): Promise<Record<string, string[]>> {
    const permissions = await this.permissionsRepository.find({
      where: { isActive: true },
      select: ['name', 'routes'],
    });

    const mappings: Record<string, string[]> = {};

    // Собираем маппинги из БД
    permissions.forEach((permission) => {
      if (permission.routes && Array.isArray(permission.routes)) {
        permission.routes.forEach((route) => {
          if (!mappings[route]) {
            mappings[route] = [];
          }
          mappings[route].push(permission.name);
        });
      }
    });

    return mappings;
  }

  /**
   * Get permissions by resource
   */
  async getPermissionsByResource(resource: string): Promise<PermissionEntity[]> {
    return this.permissionsRepository.find({
      where: { resource, isActive: true },
      order: { action: 'ASC' },
    });
  }

}
