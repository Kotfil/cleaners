import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Execute all migrations in correct order
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/run-all-migrations.ts
 */
async function runAllMigrations() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize data source');
    }

    // Define migration order
    const migrations = [
      // 1. Merge old fields to new structure (if needed)
      'merge-firstname-lastname-to-name.sql',
      'merge-users-firstname-lastname-to-name.sql',
      'merge-address-lines-to-street.sql',
      
      // 2. Create new tables/columns
      'create-client-phones-table.sql',
      'add-apt-column.sql',
      'add-user-address-and-phones.sql',
      
      // 3. Update permissions
      'add-routes-to-permissions.sql',
      
      // 4. Update users table
      'add-can-sign-in-column.sql',
      'make-role-required.sql',
      'add-secondary-role-id-to-users.sql',
      'replace-secondary-role-with-multiple-roles.sql',
      'make-name-optional.sql',
      
      // 5. Update user statuses and roles
      '20241118-add-archived-user-status.sql',
      'add-role-flags.sql',
      
      // 6. Fix phone numbers format (E.164)
      '20241121-fix-phone-numbers-remove-padding.sql',
      
      // 7. Fix NULL values in user_phones.number
      '20241201-fix-user-phones-null-values.sql',
      
      // 8. Ensure users_secondary_roles table exists
      '20241201-create-users-secondary-roles-table.sql',
      
      // 9. Fix NULL values in client_phones.number
      '20241201-fix-client-phones-null-values.sql',
      
      // 10. Client updates
      'add-client-address-fields-and-status.sql',
      
      // 11. Settings and indexes
      '20241229-add-settings-table.sql',
      '20241229-add-client-notes-index.sql',
    ];

    const migrationsDir = path.join(__dirname, '../../migrations');

    console.log(`📁 Migrations directory: ${migrationsDir}\n`);

    for (const migrationFile of migrations) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration file not found: ${migrationFile}, skipping...`);
        continue;
      }

      console.log(`📄 Executing migration: ${migrationFile}...`);

      try {
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');
        const statements = sqlContent
          .split(/^--\s*SPLIT\s*$/m)
          .map((statement) => statement.trim())
          .filter((statement) => statement.length > 0);

        if (statements.length === 0) {
          console.log(`⚠️  Migration ${migrationFile} is empty, skipping...\n`);
          continue;
        }

        for (const statement of statements) {
          await dataSource.query(statement);
        }
        console.log(`✅ Migration ${migrationFile} completed!\n`);
      } catch (error: any) {
        // Check if error is about already existing objects or missing tables (safe to ignore)
        const errorMessage = error.message || '';
        if (errorMessage.includes('already exists') || 
            errorMessage.includes('уже существует') ||
            errorMessage.includes('duplicate') ||
            errorMessage.includes('does not exist') ||
            errorMessage.includes('не существует') ||
            errorMessage.includes('skipping migration')) {
          console.log(`⚠️  Migration ${migrationFile} skipped (already applied, not needed, or table doesn't exist): ${errorMessage}\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 All migrations completed successfully!');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runAllMigrations();

