import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../config/data-source';

/**
 * Execute SQL seed file
 */
async function runSqlSeed() {
  try {
    console.log('🚀 Initializing database connection...');
    const dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '../../migrations/seed-permissions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Executing SQL seed file...\n');

    // Execute SQL
    await dataSource.query(sqlContent);

    console.log('\n✅ SQL seed executed successfully!');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing SQL seed:', error);
    process.exit(1);
  }
}

runSqlSeed();

