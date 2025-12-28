import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

/**
 * Test script to verify and get all users from database
 * 
 * Run: yarn test:users
 * 
 * Shows:
 * - Total users count
 * - Admin users count
 * - Sample users data
 */
async function testUsers() {
  let dataSource: DataSource | undefined;

  try {
    console.log('🚀 Initializing database connection...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    if (!dataSource) {
      throw new Error('Failed to initialize data source');
    }

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Get admin role
    const adminRole = await roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Get all users with relations
    const allUsers = await userRepository.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });

    // Get admin users
    const adminUsers = allUsers.filter(user => user.roleId === adminRole.id);

    // Statistics
    console.log('📊 Users Statistics:');
    console.log(`   Total users: ${allUsers.length}`);
    console.log(`   Admin users: ${adminUsers.length}`);
    console.log(`   Other roles: ${allUsers.length - adminUsers.length}\n`);

    // Show first 10 users
    console.log('👥 First 10 users:');
    allUsers.slice(0, 10).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name || 'No name'} (${user.email}) - Role: ${user.role?.name || 'N/A'} - Status: ${user.status}`);
    });

    if (allUsers.length > 10) {
      console.log(`   ... and ${allUsers.length - 10} more users\n`);
    }

    // Show admin users count breakdown
    console.log('🔐 Admin Users Breakdown:');
    const withName = adminUsers.filter(u => u.name).length;
    const withoutName = adminUsers.filter(u => !u.name).length;
    console.log(`   With name: ${withName}`);
    console.log(`   Without name: ${withoutName}\n`);

    // Show sample emails
    console.log('📧 Sample admin emails (first 5):');
    adminUsers.slice(0, 5).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`);
    });

    console.log('\n✅ Test completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing users:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

testUsers();

