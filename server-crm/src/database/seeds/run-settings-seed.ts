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
import { seedSettings } from './settings.seed';

/**
 * Runner для settings seed
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/seeds/run-settings-seed.ts
 */
async function runSettingsSeed() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize data source');
    }

    await seedSettings(dataSource);

    console.log('\n🎉 Settings seed completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running settings seed:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runSettingsSeed();

