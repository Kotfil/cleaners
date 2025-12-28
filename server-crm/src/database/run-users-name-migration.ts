import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Execute users name migration
 * This migration merges firstName and lastName into name column
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/run-users-name-migration.ts
 */
async function runUsersNameMigration() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize data source');
    }

    const migrationFile = 'merge-users-firstname-lastname-to-name.sql';
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationPath = path.join(migrationsDir, migrationFile);

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    console.log(`📄 Executing migration: ${migrationFile}...\n`);

    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    try {
      await dataSource.query(sqlContent);
      console.log(`✅ Migration ${migrationFile} completed successfully!\n`);
    } catch (error: any) {
      // Check if error is about already existing objects (safe to ignore)
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate') ||
          error.message?.includes('does not exist') ||
          error.message?.includes('column') && error.message?.includes('already')) {
        console.log(`⚠️  Migration ${migrationFile} skipped (already applied or not needed): ${error.message}\n`);
      } else {
        throw error;
      }
    }

    console.log('🎉 Users name migration completed!');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runUsersNameMigration();

