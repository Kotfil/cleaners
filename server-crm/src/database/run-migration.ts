import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../config/data-source';

/**
 * Execute SQL migration file
 */
async function runMigration() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error('❌ Please provide migration file path');
    console.log('Usage: npm run migrate <file-path>');
    process.exit(1);
  }

  try {
    console.log('🚀 Initializing database connection...');
    const dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '../..', migrationFile);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ Migration file not found: ${sqlFilePath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log(`📄 Executing migration: ${migrationFile}\n`);

    // Execute SQL
    await dataSource.query(sqlContent);

    console.log('\n✅ Migration executed successfully!');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing migration:', error);
    process.exit(1);
  }
}

runMigration();

