import { DataSource } from 'typeorm';
import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';
import { seedAdminUsers } from './admin-users.seed';
import { seedClients } from './clients.seed';

/**
 * Complete seed script - очищает и заполняет БД с нуля
 * 
 * Порядок выполнения:
 * 1. Очистка таблиц (в правильном порядке с учетом foreign keys)
 * 2. Permissions (должны быть первыми)
 * 3. Roles (зависят от permissions)
 * 4. RolePermissions (назначает permissions ролям - автоматически в seedRoles)
 * 5. Users (зависят от roles)
 * 6. Clients (опционально, для разработки)
 * 
 * Follows SOLID: Single Responsibility, Open/Closed
 * Follows GRASP: Information Expert, Creator
 */
export async function seedAll(dataSource: DataSource, options?: {
  clearTables?: boolean;
  seedClients?: boolean;
  clientCount?: number;
}): Promise<void> {
  const {
    clearTables: shouldClearTables = true,
    seedClients: shouldSeedClients = process.env.SEED_CLIENTS !== 'false',
    clientCount = parseInt(process.env.SEED_CLIENTS_COUNT || '50', 10),
  } = options || {};

  // Step 0: Synchronize schema (create tables from entities)
  console.log('🔧 Step 0: Synchronizing database schema (creating tables)...\n');
  try {
    await dataSource.synchronize();
    console.log('✅ Database schema synchronized (all tables created)\n');
    console.log('---\n');
  } catch (error: any) {
    // If synchronize fails, try to continue (tables might already exist)
    console.log('⚠️  Schema synchronization skipped (tables may already exist)\n');
    console.log('---\n');
  }

  // Step 1: Clear tables if needed
  if (shouldClearTables) {
    console.log('🗑️  Step 1: Clearing all tables...\n');
    
    // Truncate tables in correct order (respecting foreign keys)
    // Order: dependent tables first, then parent tables
    const tables = [
      'role_permissions',  // Depends on roles and permissions
      'client_phones',     // Depends on clients
      'clients',           // Independent
      'users',            // Depends on roles
      'roles',            // Independent (but referenced by users)
      'permissions',      // Independent (but referenced by role_permissions)
    ];

    for (const table of tables) {
      try {
        await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE;`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error: any) {
        // If table doesn't exist, that's fine (might be first run)
        if (error.message?.includes('does not exist') || 
            error.message?.includes('не существует')) {
          console.log(`ℹ️  Table ${table} does not exist (skipping)`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ All tables cleared!\n');
    console.log('---\n');
  }

  // Step 2: Seed permissions (must be first - roles depend on permissions)
  console.log('🌱 Step 2/5: Seeding permissions...\n');
  await seedPermissions(dataSource);
  console.log('\n---\n');

  // Step 3: Seed system roles (depends on permissions)
  // This also assigns permissions to roles automatically
  console.log('🌱 Step 3/5: Seeding system roles...\n');
  await seedRoles(dataSource);
  console.log('\n---\n');

  // Step 4: Seed admin users (depends on roles)
  console.log('🌱 Step 4/5: Seeding admin users...\n');
  await seedAdminUsers(dataSource);
  console.log('\n---\n');

  // Step 5: Seed mock clients (optional, for development/testing)
  if (shouldSeedClients) {
    console.log(`🌱 Step 5/5: Seeding mock clients (${clientCount} clients)...\n`);
    await seedClients(dataSource, clientCount);
  } else {
    console.log('🌱 Step 5/5: Skipping clients seed (SEED_CLIENTS=false)\n');
  }

  console.log('\n🎉 All seeds completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Permissions created/updated');
  console.log('   ✅ System roles created (admin, manager, cleaner)');
  console.log('   ✅ Role-permission assignments created');
  console.log('   ✅ Admin users created');
  if (shouldSeedClients) {
    console.log(`   ✅ Mock clients created (${clientCount} clients)`);
  }
  console.log('\n💡 Admin users credentials:');
  console.log('   - jc@crm.com / 111111');
  console.log('   - vitaly@crm.com / 222222');
  console.log('   - test2@test.test / 111111');
  console.log('\n✅ Database is ready to use!');
}

