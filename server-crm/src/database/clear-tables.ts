import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Clear all tables (alternative to dropping database)
 * 
 * Use this if you cannot drop database due to active connections.
 * This will truncate all tables in correct order (respecting foreign keys).
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/clear-tables.ts
 */
async function clearTables() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize data source');
    }

    console.log('🗑️  Clearing all tables...\n');

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
        if (error.message?.includes('does not exist')) {
          console.log(`ℹ️  Table ${table} does not exist (skipping)`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ All tables cleared!\n');
    console.log('💡 Next steps:');
    console.log('   1. Run migrations: npm run migrate:all');
    console.log('   2. Run seeds: npm run seed:all');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing tables:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

clearTables();

