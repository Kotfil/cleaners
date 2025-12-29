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
    console.log(`✅ Loaded .env from: ${envPath}`);
    break;
  }
}

// Теперь импортируем AppDataSource после загрузки .env
import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { seedAll } from './seeds/seed-all';

/**
 * Run complete seed - очищает и заполняет БД с нуля
 * 
 * Порядок выполнения:
 * 1. Очистка таблиц
 * 2. Permissions
 * 3. Roles (с назначением permissions)
 * 4. Users
 * 5. Clients (опционально)
 * 
 * Run: yarn seed:all
 */
async function runSeedAll() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (dataSource) {
      await seedAll(dataSource, {
        clearTables: true,
        seedClients: process.env.SEED_CLIENTS !== 'false',
        clientCount: parseInt(process.env.SEED_CLIENTS_COUNT || '1', 10),
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seed:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runSeedAll();

