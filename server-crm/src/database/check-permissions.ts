import { AppDataSource } from '../config/data-source';

async function checkPermissions() {
  try {
    console.log('🚀 Connecting to database...');
    const dataSource = await AppDataSource.initialize();
    console.log('✅ Connected!\n');

    // Check role_permissions count
    const result = await dataSource.query(`
      SELECT 
        r.name as role_name,
        COUNT(rp.id) as permissions_count,
        STRING_AGG(p.name, ', ' ORDER BY p.name) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp."roleId"
      LEFT JOIN permissions p ON rp."permissionId" = p.id
      GROUP BY r.name
      ORDER BY r.name;
    `);

    console.log('📊 Permissions by role:');
    console.table(result);

    // Check manager role specifically
    const managerPerms = await dataSource.query(`
      SELECT 
        r.name as role_name,
        p.name as permission_name,
        rp."isValid" as is_valid
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp."roleId"
      LEFT JOIN permissions p ON rp."permissionId" = p.id
      WHERE r.name = 'manager'
      ORDER BY p.name;
    `);

    console.log('\n📋 Manager role permissions:');
    console.table(managerPerms);

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPermissions();

