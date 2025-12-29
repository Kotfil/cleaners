// ⚠️ ВАЖНО: Загружаем .env ПЕРЕД импортом AppDataSource
import * as dotenv from 'dotenv';
import { resolve, join } from 'path';

// Загружаем .env файл - пробуем несколько путей
const envPaths = [
  join(process.cwd(), '.env'),           // Корень проекта (server-crm/.env)
  resolve(__dirname, '../../.env'),      // Относительно src/database/
  resolve(__dirname, '../../../.env'),    // На уровень выше
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    break;
  }
}

// Теперь импортируем AppDataSource после загрузки .env
import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { seedPermissions } from './seeds/permissions.seed';
import { seedRoles } from './seeds/roles.seed';
import { seedAdminUsers } from './seeds/admin-users.seed';
import { seedClients } from './seeds/clients.seed';
import { seedSettings } from './seeds/settings.seed';

/**
 * Run all seeds in correct order
 * 
 * 1. Permissions (must be first)
 * 2. Roles (depends on permissions)
 * 3. Admin Users (depends on roles)
 * 4. Settings (application configuration)
 * 5. Mock Clients (optional, for development/testing)
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/run-all-seeds.ts
 */
async function runAllSeeds() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (dataSource) {
      // 1. Seed permissions (must be first - roles depend on permissions)
      console.log('🌱 Step 1/5: Seeding permissions...\n');
      await seedPermissions(dataSource);
      
      console.log('\n---\n');
      
      // 2. Seed system roles
      console.log('🌱 Step 2/5: Seeding system roles...\n');
      await seedRoles(dataSource);
      
      console.log('\n---\n');
      
      // 3. Seed admin users
      console.log('🌱 Step 3/5: Seeding admin users...\n');
      await seedAdminUsers(dataSource);
      
      console.log('\n---\n');
      
      // 4. Seed settings (application configuration)
      console.log('🌱 Step 4/5: Seeding application settings...\n');
      await seedSettings(dataSource);
      
      console.log('\n---\n');
      
      // 5. Seed mock clients (optional, for development)
      const shouldSeedClients = process.env.SEED_CLIENTS !== 'false';
      if (shouldSeedClients) {
        const clientCount = parseInt(process.env.SEED_CLIENTS_COUNT || '1', 10);
        console.log(`🌱 Step 5/5: Seeding mock clients (${clientCount} clients)...\n`);
        await seedClients(dataSource, clientCount);
      } else {
        console.log('🌱 Step 5/5: Skipping clients seed (SEED_CLIENTS=false)\n');
      }
    }

    console.log('\n🎉 All seeds completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Permissions created/updated');
    console.log('   ✅ System roles created (admin, manager, cleaner)');
    console.log('   ✅ Admin users created');
    console.log('   ✅ Application settings created');
    if (process.env.SEED_CLIENTS !== 'false') {
      console.log('   ✅ Mock clients created');
    }
    console.log('\n💡 Admin users credentials:');
    console.log('   - filippkotenko@outlook.com / 222222@A');
    console.log('   - syslik@gmail.com / 222222@A');
    console.log('   - sanechka@gmail.com / 222222@A');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runAllSeeds();

