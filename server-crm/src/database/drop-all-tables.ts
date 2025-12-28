import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Drop all tables - DESTRUCTIVE operation!
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/drop-all-tables.ts
 */
async function dropAllTables() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize data source');
    }

    console.log('⚠️  WARNING: Dropping all tables...\n');

    // Drop all tables CASCADE (will drop in correct order automatically)
    const tables = [
      'users_secondary_roles',
      'role_permissions',
      'user_phones',
      'client_phones',
      'users',
      'clients',
      'roles',
      'permissions',
    ];

    for (const table of tables) {
      try {
        await dataSource.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error: any) {
        console.log(`⚠️  Error dropping ${table}:`, error.message);
      }
    }

    console.log('\n✅ All tables dropped!\n');
    console.log('💡 Next steps:');
    console.log('   1. Run schema sync: npm run db:sync');
    console.log('   2. Run seeds: npm run seed:all');

    if (dataSource) {
      await dataSource.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

dropAllTables();

