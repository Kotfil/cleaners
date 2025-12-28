import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Synchronize database schema - creates tables from entities
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/sync-schema.ts
 */
async function syncSchema() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize data source');
    }

    // Step 1: Drop existing foreign key constraints that might cause issues
    console.log('🔧 Step 1: Cleaning up existing constraints...\n');
    try {
      // Drop users_secondary_roles table if it exists (will be recreated by synchronize)
      await dataSource.query(`
        DROP TABLE IF EXISTS "users_secondary_roles" CASCADE;
      `);
      console.log('✅ Cleaned up existing junction tables\n');
    } catch (error: any) {
      // Ignore errors - table might not exist
      console.log('ℹ️  No existing junction tables to clean\n');
    }

    // Step 2: Synchronize schema (create tables from entities)
    console.log('🔧 Step 2: Synchronizing database schema (creating tables from entities)...\n');
    await dataSource.synchronize();
    console.log('✅ Database schema synchronized (all tables created)!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error synchronizing schema:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

syncSchema();

