import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { seedClients } from './clients.seed';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Run clients seed only
 * 
 * Creates mock clients for development and testing
 * 
 * Usage:
 *   npm run seed:clients                    # Creates 50 clients (default)
 *   SEED_CLIENTS_COUNT=150 npm run seed:clients  # Creates 150 clients
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/seeds/run-clients-seed.ts
 */
async function runClientsSeed() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize database connection');
    }

    const clientCount = parseInt(process.env.SEED_CLIENTS_COUNT || '50', 10);
    await seedClients(dataSource, clientCount);

    console.log('\n🎉 Clients seed completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running clients seed:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runClientsSeed();

