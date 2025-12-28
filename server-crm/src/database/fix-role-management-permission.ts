import { DataSource, In, Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { SystemRole } from '../enums/system-role.enum';
import * as dotenv from 'dotenv';

dotenv.config();

const ROLE_MANAGEMENT_RESOURCE = 'role-management';


async function getRoleManagementPermissions(
  permissionRepository: Repository<PermissionEntity>
): Promise<PermissionEntity[]> {
  return permissionRepository.find({
    where: { resource: ROLE_MANAGEMENT_RESOURCE }
  });
}


async function getOwnerRole(
  roleRepository: Repository<Role>
): Promise<Role | null> {
  return roleRepository.findOne({
    where: { name: SystemRole.OWNER }
  });
}


async function getRoleManagementRolePermissions(
  rolePermissionRepository: Repository<RolePermission>,
  permissionIds: string[]
): Promise<RolePermission[]> {
  return rolePermissionRepository.find({
    where: { permissionId: In(permissionIds) },
    relations: ['role']
  });
}


async function processRolePermissions(
  rolePermissionRepository: Repository<RolePermission>,
  rolePermissions: RolePermission[],
  roleManagementPermissions: PermissionEntity[],
  ownerRoleName: string
): Promise<{ kept: number; removed: number }> {
  let keptCount = 0;
  let removedCount = 0;

  for (const rolePermission of rolePermissions) {
    const role = rolePermission.role;
    
    if (!role) {
      console.log(`⚠️  Role not found for rolePermission ${rolePermission.id}, removing...`);
      await rolePermissionRepository.remove(rolePermission);
      removedCount++;
      continue;
    }

    const permission = roleManagementPermissions.find(p => p.id === rolePermission.permissionId);
    const permissionName = permission?.name || 'unknown';

    if (role.name.toLowerCase() === ownerRoleName.toLowerCase()) {
      console.log(`✅ Keeping ${permissionName} for Owner role`);
      keptCount++;
    } else {
      console.log(`❌ Removing ${permissionName} from role: ${role.name} (${role.id})`);
      await rolePermissionRepository.remove(rolePermission);
      removedCount++;
    }
  }

  return { kept: keptCount, removed: removedCount };
}


async function fixRoleManagementPermission(): Promise<void> {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize data source');
    }

    const roleRepository = dataSource.getRepository(Role);
    const rolePermissionRepository = dataSource.getRepository(RolePermission);
    const permissionRepository = dataSource.getRepository(PermissionEntity);

    // Get role-management permissions
    const roleManagementPermissions = await getRoleManagementPermissions(permissionRepository);

    if (roleManagementPermissions.length === 0) {
      console.log('⚠️  No role-management permissions found. Nothing to fix.');
      return;
    }

    console.log(`📋 Found ${roleManagementPermissions.length} role-management permission(s):`);
    roleManagementPermissions.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
    });
    console.log('');

 
    const ownerRole = await getOwnerRole(roleRepository);

    if (!ownerRole) {
      console.log('⚠️  Owner role not found. Please run yarn seed:permissions first.');
      return;
    }

    console.log(`👤 Owner role found: ${ownerRole.name} (ID: ${ownerRole.id})\n`);

 
    const permissionIds = roleManagementPermissions.map(p => p.id);
    const allRolePermissions = await getRoleManagementRolePermissions(
      rolePermissionRepository,
      permissionIds
    );

    console.log(`🔍 Found ${allRolePermissions.length} role-permission(s) with role-management permissions\n`);

  
    const { kept, removed } = await processRolePermissions(
      rolePermissionRepository,
      allRolePermissions,
      roleManagementPermissions,
      ownerRole.name
    );

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Kept permissions for Owner: ${kept}`);
    console.log(`   ❌ Removed permissions from other roles: ${removed}`);
    console.log(`\n🎉 Fix completed successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing role-management permission:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

fixRoleManagementPermission();

