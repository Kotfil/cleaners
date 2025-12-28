import { DataSource } from 'typeorm';
import { PermissionEntity } from '../../entities/permission.entity';
import { Permission } from '../../enums/permission.enum';

/**
 * Seed script for STATIC permissions
 * 
 * ⚠️ ЕДИНСТВЕННЫЙ способ создать/обновить permissions в БД
 * 
 * Создает/обновляет все фиксированные permissions для страниц:
 * - Chat, Calendar, Quotes, Users, Company Team, Money Flow,
 *   Clients, My Cleaning Day, Pricing, Role Management, Search
 * 
 * Run: yarn seed:permissions
 * 
 * Note: Role-permission assignments делаются динамически через UI
 * Follows SOLID: Open/Closed Principle
 * Follows GRASP: Information Expert
 */
export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(PermissionEntity);

  console.log('🌱 Starting permissions seed...');

  // Permission definitions with descriptions and routes
  const permissionDefinitions: Array<{
    name: string;
    description: string;
    resource: string;
    action: string;
    routes?: string[];
  }> = [
    // User Management
    { name: Permission.USER_CREATE, description: 'Create new users', resource: 'user', action: 'create', routes: ['/users'] },
    { name: Permission.USER_READ, description: 'View users', resource: 'user', action: 'read', routes: ['/users'] },
    { name: Permission.USER_UPDATE, description: 'Update user information', resource: 'user', action: 'update', routes: ['/users'] },
    { name: Permission.USER_DELETE, description: 'Delete users', resource: 'user', action: 'delete', routes: ['/users'] },
    
    // Company Team Management
    { name: Permission.COMPANY_TEAM_READ, description: 'View company team', resource: 'company-team', action: 'read', routes: ['/company-team'] },
    
    // Role Management
    { name: Permission.ROLE_MANAGEMENT_CREATE, description: 'Create roles', resource: 'role-management', action: 'create', routes: ['/role-management'] },
    { name: Permission.ROLE_MANAGEMENT_READ, description: 'View role management', resource: 'role-management', action: 'read', routes: ['/role-management'] },
    { name: Permission.ROLE_MANAGEMENT_UPDATE, description: 'Update role permissions', resource: 'role-management', action: 'update', routes: ['/role-management'] },
    
    // Client Management
    { name: Permission.CLIENT_CREATE, description: 'Create new clients', resource: 'client', action: 'create', routes: ['/clients'] },
    { name: Permission.CLIENT_READ, description: 'View clients', resource: 'client', action: 'read', routes: ['/clients'] },
    { name: Permission.CLIENT_UPDATE, description: 'Update client information', resource: 'client', action: 'update', routes: ['/clients'] },
    { name: Permission.CLIENT_DELETE, description: 'Delete clients', resource: 'client', action: 'delete', routes: ['/clients'] },
    
    // Chat Management
    { name: Permission.CHAT_READ, description: 'View chat', resource: 'chat', action: 'read', routes: ['/chat'] },
    
    // Order Management
    { name: Permission.ORDER_READ, description: 'View orders', resource: 'order', action: 'read', routes: ['/orders'] },
    
    // Quotes Management
    { name: Permission.QUOTES_READ, description: 'View quotes', resource: 'quotes', action: 'read', routes: ['/quotes'] },
    
    // Calendar Management
    { name: Permission.CALENDAR_READ, description: 'View calendar', resource: 'calendar', action: 'read', routes: ['/calendar'] },
    
    // My Cleaning Day Management
    { name: Permission.MY_CLEANING_DAY_READ, description: 'View my cleaning day', resource: 'my-cleaning-day', action: 'read', routes: ['/my-cleaning-day'] },
    
    // Pricing Management
    { name: Permission.PRICING_CREATE, description: 'Create pricing records', resource: 'pricing', action: 'create', routes: ['/pricing'] },
    { name: Permission.PRICING_READ, description: 'View pricing', resource: 'pricing', action: 'read', routes: ['/pricing'] },
    { name: Permission.PRICING_UPDATE, description: 'Update pricing', resource: 'pricing', action: 'update', routes: ['/pricing'] },
    { name: Permission.PRICING_DELETE, description: 'Delete pricing records', resource: 'pricing', action: 'delete', routes: ['/pricing'] },
    
    // Money Flow Management
    { name: Permission.MONEY_FLOW_READ, description: 'View money flow', resource: 'money-flow', action: 'read', routes: ['/money-flow'] },
    
    // Reports
    { name: Permission.REPORTS_READ, description: 'View reports', resource: 'reports', action: 'read', routes: ['/search'] },
    
    // Settings
    { name: Permission.SETTINGS_READ, description: 'View settings', resource: 'settings', action: 'read', routes: ['/settings'] },
  ];

  // Create or update permissions
  const createdPermissions: Record<string, PermissionEntity> = {};
  
  for (const permDef of permissionDefinitions) {
    let permission = await permissionRepository.findOne({
      where: { name: permDef.name },
    });

    if (!permission) {
      permission = permissionRepository.create(permDef);
      await permissionRepository.save(permission);
      console.log(`✅ Created permission: ${permDef.name}`);
    } else {
      // Update description, routes and other fields if needed
      permission.description = permDef.description;
      permission.resource = permDef.resource;
      permission.action = permDef.action;
      permission.routes = permDef.routes || [];
      await permissionRepository.save(permission);
      console.log(`♻️  Updated permission: ${permDef.name}`);
    }

    createdPermissions[permDef.name] = permission;
  }

  console.log(`\n✅ Created/updated ${Object.keys(createdPermissions).length} permissions`);
  console.log('\n💡 Tip: Assign permissions to roles via:');
  console.log('   - UI: Role Management page');
  console.log('   - API: POST /api/roles/:id/permissions');
  console.log('\n🎉 Permissions seed completed!');
}

