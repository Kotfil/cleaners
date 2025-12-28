import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Drop and recreate database
 * 
 * ⚠️ ВНИМАНИЕ: Удаляет все данные в БД!
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/drop-database.ts
 */
async function dropDatabase() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    
    // Connect to postgres database (not to target database)
    const postgresDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'postgres', // Connect to postgres DB
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    await postgresDataSource.initialize();
    console.log('✅ Connected to PostgreSQL!\n');

    const dbName = process.env.DB_DATABASE || 'jeny_crm';
    
    console.log(`🗑️  Dropping database: ${dbName}...`);
    console.log(`💡 Note: If database has active connections, close them first (stop server, close DB tools)\n`);
    
    // Try to drop database (will fail if there are active connections)
    // User should close all connections manually if needed
    try {
      await postgresDataSource.query(`DROP DATABASE IF EXISTS "${dbName}";`);
      console.log(`✅ Database ${dbName} dropped!\n`);
    } catch (error: any) {
      const errorMessage = error.message || '';
      const errorCode = error.code || '';
      
      // Check for various "database in use" error codes and messages
      if (errorCode === '55006' || 
          errorCode === '3D000' ||
          errorMessage.includes('is being accessed') ||
          errorMessage.includes('being accessed by other users') ||
          errorMessage.includes('database is being accessed')) {
        console.log(`\n⚠️  Cannot drop database ${dbName} - there are active connections.`);
        console.log(`\n💡 Solutions:`);
        console.log(`   1. Stop the server (if running): npm run start:dev`);
        console.log(`   2. Close all database tools (pgAdmin, DBeaver, etc.)`);
        console.log(`   3. Or manually drop it using psql:`);
        console.log(`      psql -U postgres -c "DROP DATABASE IF EXISTS ${dbName};"`);
        console.log(`   4. Then run: npm run migrate:all && npm run seed:all\n`);
        throw new Error('Database has active connections. Please close them first.');
      }
      // If database doesn't exist, that's fine - we'll create it
      if (errorCode === '3D000' || errorMessage.includes('does not exist')) {
        console.log(`ℹ️  Database ${dbName} does not exist (will be created)\n`);
      } else {
        throw error;
      }
    }
    
    console.log(`🔨 Creating database: ${dbName}...`);
    await postgresDataSource.query(`CREATE DATABASE "${dbName}";`);
    console.log(`✅ Database ${dbName} created!\n`);

    await postgresDataSource.destroy();
    
    console.log('🎉 Database reset completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run migrations: npm run migrate:all');
    console.log('   2. Run seeds: npm run seed:all');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping database:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

dropDatabase();

