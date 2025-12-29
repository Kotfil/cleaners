// ⚠️ ВАЖНО: Загружаем .env ПЕРЕД импортом AppDataSource
import * as dotenv from 'dotenv';
import { resolve, join } from 'path';

// Загружаем .env файл - пробуем несколько путей
const envPaths = [
  join(process.cwd(), '.env'),           // Корень проекта (server-crm/.env)
  resolve(__dirname, '../../../.env'),   // Относительно src/database/seeds/
  resolve(__dirname, '../../../../.env'), // На уровень выше
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    break;
  }
}

// Теперь импортируем AppDataSource после загрузки .env
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { seedAdminUsers } from './admin-users.seed';

/**
 * Admin users seed runner
 * 
 * Создает/обновляет admin пользователей:
 * - jc@crm.com / 111111
 * - vitaly@crm.com / 222222
 * - test2@test.test / 111111
 * 
 * Run with: yarn seed:admin-users
 * 
 * Note: Requires 'admin' role to exist (run 'yarn seed:permissions' first)
 */
async function runAdminUsersSeed() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (dataSource) {
      await seedAdminUsers(dataSource);
    }

    console.log('\n🎉 Admin users seed completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running admin users seed:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runAdminUsersSeed();

