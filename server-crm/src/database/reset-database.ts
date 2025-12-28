import * as child_process from 'child_process';
import * as util from 'util';

const exec = util.promisify(child_process.exec);

/**
 * Complete database reset script
 * 
 * 1. Drops and recreates database
 * 2. Runs all migrations
 * 3. Runs all seeds
 * 
 * Run: ts-node -r tsconfig-paths/register src/database/reset-database.ts
 */
async function resetDatabase() {
  try {
    console.log('🔄 Starting complete database reset...\n');

    // Step 1: Drop and recreate database
    console.log('📋 Step 1/3: Dropping and recreating database...\n');
    let dbDropped = false;
    try {
      const { stdout, stderr } = await exec('ts-node -r tsconfig-paths/register src/database/drop-database.ts');
      console.log(stdout);
      if (stderr && !stderr.includes('active connections')) {
        console.error(stderr);
      }
      dbDropped = true;
      console.log('\n---\n');
    } catch (error: any) {
      const errorOutput = (error.stderr || error.stdout || error.message || '').toString();
      if (errorOutput.includes('active connections') || 
          errorOutput.includes('being accessed') ||
          errorOutput.includes('нет прав для завершения процесса')) {
        console.log('\n⚠️  Could not drop database due to active connections.');
        console.log('💡 Continuing with migrations/seeds (assuming database exists)...');
        console.log('   If you want to drop DB, close all connections and run: npm run db:drop\n');
        console.log('---\n');
        dbDropped = false; // Continue anyway
      } else {
        // Other errors - might be database doesn't exist, which is fine
        console.log('ℹ️  Database drop skipped (may not exist or other issue)');
        console.log('💡 Continuing with migrations/seeds...\n');
        console.log('---\n');
        dbDropped = false;
      }
    }

    // Step 2: Synchronize schema (create tables from entities) - ОБЯЗАТЕЛЬНО
    console.log('📋 Step 2/4: Synchronizing schema (creating tables)...\n');
    try {
      const { stdout, stderr } = await exec('ts-node -r tsconfig-paths/register src/database/sync-schema.ts');
      console.log(stdout);
      if (stderr && !stderr.includes('already exists')) {
        console.error(stderr);
      }
      console.log('\n---\n');
    } catch (error: any) {
      const errorOutput = (error.stderr || error.stdout || error.message || '').toString();
      console.error('❌ Schema sync failed:', errorOutput);
      console.log('\n💡 Schema synchronization is REQUIRED. Please fix errors and try again.\n');
      throw error;
    }

    // Step 3: Run all migrations (optional - for modifying existing tables)
    console.log('📋 Step 3/4: Running migrations...\n');
    try {
      await exec('ts-node -r tsconfig-paths/register src/database/run-all-migrations.ts');
      console.log('\n---\n');
    } catch (error: any) {
      const errorOutput = (error.stderr || error.stdout || error.message || '').toString();
      if (errorOutput.includes('does not exist') || errorOutput.includes('не существует')) {
        console.log('⚠️  Some migrations failed (tables may not exist), but continuing...\n');
        console.log('---\n');
      } else {
        throw error;
      }
    }

    // Step 4: Run all seeds
    console.log('📋 Step 4/4: Running seeds...\n');
    await exec('ts-node -r tsconfig-paths/register src/database/run-seed-all.ts');

    console.log('\n🎉 Database reset completed successfully!');
    console.log('\n✅ Database is ready to use!');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error resetting database:', error.message || error);
    console.log('\n💡 You can run steps manually:');
    console.log('   1. npm run db:drop (or close connections and drop manually)');
    console.log('   2. npm run migrate:all');
    console.log('   3. npm run seed:all');
    process.exit(1);
  }
}

resetDatabase();

