import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';

/**
 * Main seed runner
 * 
 * Создает базовые данные при инициализации:
 * 1. Permissions (31 шт) - статические
 * 2. System Roles (3 шт) - admin, manager, cleaner
 * 
 * Run with: yarn seed:permissions
 */
async function runSeeds() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (dataSource) {
      // 1. Seed permissions (must be first - roles depend on permissions)
      await seedPermissions(dataSource);
      
      console.log('\n---\n');
      
      // 2. Seed system roles
      await seedRoles(dataSource);
    }

    console.log('\n🎉 All seeds completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 31 static permissions created');
    console.log('   - 3 system roles created (admin, manager, cleaner)');
    console.log('   - Ready to assign permissions to roles via UI');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runSeeds();

