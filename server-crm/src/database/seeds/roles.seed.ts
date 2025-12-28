import { DataSource } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { PermissionEntity } from '../../entities/permission.entity';
import { SystemRole } from '../../enums/system-role.enum';

/**
 * Seed script for SYSTEM roles (базовые фиксированные роли)
 * 
 * ⚠️ Создает 3 базовые роли при инициализации БД:
 * - admin: полный доступ ко всем функциям (все permissions)
 * - manager: управление командой и клиентами (все permissions)
 * - cleaner: базовый доступ для уборщиков (только :read permissions)
 * 
 * Эти роли нельзя удалить (isSystem = true)
 * Permissions назначаются автоматически при seed
 * 
 * Run: yarn seed:permissions (автоматически вызывает этот seed)
 */
export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);
  const rolePermissionRepository = dataSource.getRepository(RolePermission);
  const permissionRepository = dataSource.getRepository(PermissionEntity);

  console.log('🌱 Starting system roles seed...');

  // Определения базовых ролей
  const systemRoleDefinitions = [
    {
      name: SystemRole.OWNER,
      description: 'System owner with all permissions. Cannot be modified.',
      isSystem: true,
      isDefault: false,
    },
    {
      name: SystemRole.ADMIN,
      description: 'Administrator with full access to all features',
      isSystem: true,
      isDefault: false,
    },
    {
      name: SystemRole.MANAGER,
      description: 'Manager with access to team and client management',
      isSystem: true,
      isDefault: false,
    },
    {
      name: SystemRole.CLEANER,
      description: 'Cleaner with basic access to tasks and schedule',
      isSystem: true,
      isDefault: true, // Роль по умолчанию для новых пользователей
    },
  ];

  // Создать или обновить системные роли
  const createdRoles: Record<string, Role> = {};
  
  for (const roleDef of systemRoleDefinitions) {
    let role = await roleRepository.findOne({
      where: { name: roleDef.name },
    });

    if (!role) {
      role = roleRepository.create(roleDef);
      await roleRepository.save(role);
      console.log(`✅ Created system role: ${roleDef.name}`);
    } else {
      // Обновить описание и флаги
      role.description = roleDef.description;
      role.isSystem = roleDef.isSystem;
      role.isDefault = roleDef.isDefault;
      await roleRepository.save(role);
      console.log(`♻️  Updated system role: ${roleDef.name}`);
    }
    
    createdRoles[roleDef.name] = role;
  }

  // Назначить permissions ролям
  console.log('\n📋 Assigning permissions to roles...');
  
  // Получить все permissions
  const allPermissions = await permissionRepository.find();
  
  if (allPermissions.length === 0) {
    console.log('⚠️  No permissions found. Run permissions seed first.');
  } else {
    // Owner: все permissions
    const ownerRole = createdRoles[SystemRole.OWNER];
    if (ownerRole) {
      // Удалить существующие permissions для owner
      await rolePermissionRepository.delete({ roleId: ownerRole.id });
      
      // Назначить все permissions
      for (const permission of allPermissions) {
        const existing = await rolePermissionRepository.findOne({
          where: { roleId: ownerRole.id, permissionId: permission.id },
        });
        
        if (!existing) {
          const rolePermission = rolePermissionRepository.create({
            roleId: ownerRole.id,
            permissionId: permission.id,
            isValid: true,
          });
          await rolePermissionRepository.save(rolePermission);
        }
      }
      console.log(`✅ Assigned ${allPermissions.length} permissions to owner role`);
    }
    
    // Admin: все permissions кроме role-management:read (только для Owner)
    const adminRole = createdRoles[SystemRole.ADMIN];
    if (adminRole) {
      // Удалить существующие permissions для admin
      await rolePermissionRepository.delete({ roleId: adminRole.id });
      
      // Назначить все permissions кроме role-management:read
      const adminPermissions = allPermissions.filter(
        p => !(p.resource === 'role-management' && p.action === 'read')
      );
      for (const permission of adminPermissions) {
        const existing = await rolePermissionRepository.findOne({
          where: { roleId: adminRole.id, permissionId: permission.id },
        });
        
        if (!existing) {
          const rolePermission = rolePermissionRepository.create({
            roleId: adminRole.id,
            permissionId: permission.id,
            isValid: true,
          });
          await rolePermissionRepository.save(rolePermission);
        }
      }
      console.log(`✅ Assigned ${adminPermissions.length} permissions to admin role (excluding role-management:read)`);
    }
    
    // Manager: все permissions кроме role-management:read (только для Owner)
    const managerRole = createdRoles[SystemRole.MANAGER];
    if (managerRole) {
      // Удалить существующие permissions для manager
      await rolePermissionRepository.delete({ roleId: managerRole.id });
      
      // Назначить все permissions кроме role-management:read
      const managerPermissions = allPermissions.filter(
        p => !(p.resource === 'role-management' && p.action === 'read')
      );
      for (const permission of managerPermissions) {
        const existing = await rolePermissionRepository.findOne({
          where: { roleId: managerRole.id, permissionId: permission.id },
        });
        
        if (!existing) {
          const rolePermission = rolePermissionRepository.create({
            roleId: managerRole.id,
            permissionId: permission.id,
            isValid: true,
          });
          await rolePermissionRepository.save(rolePermission);
        }
      }
      console.log(`✅ Assigned ${managerPermissions.length} permissions to manager role (excluding role-management:read)`);
    }
    
    // Cleaner: только :read permissions
    const cleanerRole = createdRoles[SystemRole.CLEANER];
    if (cleanerRole) {
      // Удалить существующие permissions для cleaner
      await rolePermissionRepository.delete({ roleId: cleanerRole.id });
      
      // Назначить только :read permissions
      const readPermissions = allPermissions.filter(p => p.action === 'read');
      for (const permission of readPermissions) {
        const existing = await rolePermissionRepository.findOne({
          where: { roleId: cleanerRole.id, permissionId: permission.id },
        });
        
        if (!existing) {
          const rolePermission = rolePermissionRepository.create({
            roleId: cleanerRole.id,
            permissionId: permission.id,
            isValid: true,
          });
          await rolePermissionRepository.save(rolePermission);
        }
      }
      console.log(`✅ Assigned ${readPermissions.length} read permissions to cleaner role`);
    }
  }

  console.log(`\n✅ Created/updated ${systemRoleDefinitions.length} system roles`);
  console.log('\n💡 Tips:');
  console.log('   - System roles cannot be deleted (isSystem = true)');
  console.log('   - Owner role cannot be modified (has all permissions, hidden from role-management)');
  console.log('   - Admin and Manager have all permissions');
  console.log('   - Cleaner has only read permissions');
  console.log('   - Permissions can be modified via: UI Role Management page or API');
  console.log('\n🎉 System roles seed completed!');
}

