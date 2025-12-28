import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { UserPhone } from '../../entities/user-phone.entity';
import { Role } from '../../entities/role.entity';
import { SystemRole } from '../../enums/system-role.enum';
import { UserStatus } from '../../enums/user-status.enum';

  /**
   * Seed script for ADMIN users
   * 
   * ⚠️ ЕДИНСТВЕННЫЙ способ создать/обновить admin аккаунты в БД
   * 
   * Создает/обновляет 3 admin пользователя + 15 mock admins:
   * - jc@crm.com / 222222@A
   * - vitaly@crm.com / 222222@A
   * - test2@test.test / 222222@A
   * - mock admins: MockAdmin123!
   * 
   * Run: yarn seed:admin-users
   * 
   * Note: Role "admin" должна существовать (создается через yarn seed:permissions)
   * Follows SOLID: Open/Closed Principle
   * Follows GRASP: Information Expert
   */
export async function seedAdminUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const phoneRepository = dataSource.getRepository(UserPhone);
  const roleRepository = dataSource.getRepository(Role);

  console.log('🌱 Starting admin users seed...');

  // Проверяем, что роль owner существует (для jc@crm.com)
  const ownerRole = await roleRepository.findOne({
    where: { name: SystemRole.OWNER },
  });

  if (!ownerRole) {
    throw new Error(`Role '${SystemRole.OWNER}' not found. Please run 'yarn seed:permissions' first.`);
  }

  // Проверяем, что роль admin существует (для остальных)
  const adminRole = await roleRepository.findOne({
    where: { name: SystemRole.ADMIN },
  });

  if (!adminRole) {
    throw new Error(`Role '${SystemRole.ADMIN}' not found. Please run 'yarn seed:permissions' first.`);
  }

  type AdminUserDefinition = {
    email: string;
    password: string;
    name: string;
  };

  const adminUserDefinitions: AdminUserDefinition[] = [
    {
      email: 'jc@crm.com',
      password: '222222@A',
      name: 'JC Owner',
    },
    {
      email: 'vitaly@crm.com',
      password: '222222@A',
      name: 'Vitaly Admin',
    },
    {
      email: 'test2@test.test',
      password: '222222@A',
      name: 'Test User',
    },
  ];

  const mockAdminCount = 15;
  const mockAdminPassword = 'MockAdmin123!';
  const firstNames = [
    'Alex', 'Sam', 'Kate', 'Olivia', 'Henry', 'Grace', 'Ethan', 'Mia', 'Leo', 'Sophia',
    'Liam', 'Ava', 'Noah', 'Isabella', 'Mason', 'Charlotte', 'Logan', 'Amelia', 'Lucas', 'Harper',
  ];
  const lastNames = [
    'Anderson', 'Bennett', 'Coleman', 'Daniels', 'Edwards', 'Fisher', 'Griffin', 'Harris', 'Iverson', 'Johnson',
    'Keller', 'Lewis', 'Morris', 'Nelson', 'Owens', 'Parker', 'Quinn', 'Roberts', 'Stevens', 'Turner',
  ];
  const domains = [
    'demo.io', 'mock.dev', 'sample.app', 'playground.cr', 'lab.crm',
  ];

  /**
   * Генерирует случайный телефонный номер в формате +1XXXXXXXXXX (12 символов: +1 + 10 цифр)
   */
  function generateRandomPhone(): string {
    const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
    return `+1${digits}`;
  }

  /**
   * Генерирует массив телефонов (1-3 штуки для пользователей)
   */
  function generatePhones(): Array<{ number: string; isPrimary: boolean }> {
    const phoneCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 phones
    const phones: Array<{ number: string; isPrimary: boolean }> = [];
    
    for (let i = 0; i < phoneCount; i++) {
      phones.push({
        number: generateRandomPhone(),
        isPrimary: i === 0 // Первый телефон всегда primary
      });
    }
    
    return phones;
  }

  const generateMockAdmin = (index: number): AdminUserDefinition => {
    const first = firstNames[index % firstNames.length];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${first} ${last}`;
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const uniqueSuffix = `${Date.now()}${index}${Math.floor(Math.random() * 1000)}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}.${uniqueSuffix}@${domain}`;
    return {
      email,
      password: mockAdminPassword,
      name,
    };
  };

  const mockAdmins = Array.from({ length: mockAdminCount }, (_, index) => generateMockAdmin(index));
  adminUserDefinitions.push(...mockAdmins);

  const createdUsers: Record<string, User> = {};

  for (const userDef of adminUserDefinitions) {
    let user = await userRepository.findOne({
      where: { email: userDef.email },
    });

    const hashedPassword = await bcrypt.hash(userDef.password, 12);
    
    // jc@crm.com получает роль Owner, остальные - Admin
    const assignedRole = userDef.email === 'jc@crm.com' ? ownerRole : adminRole;

    if (!user) {
      user = userRepository.create({
        email: userDef.email,
        password: hashedPassword,
        name: userDef.name,
        roleId: assignedRole.id,
        status: UserStatus.ACTIVE,
        canSignIn: true,
      });
      const savedUser = await userRepository.save(user);

      // Создаем телефоны для нового пользователя
      const phones = generatePhones();
      const phoneEntities = phones.map(phoneData => 
        phoneRepository.create({
          userId: savedUser.id,
          number: phoneData.number,
          isPrimary: phoneData.isPrimary,
        })
      );
      await phoneRepository.save(phoneEntities);
      user = savedUser;
    } else {
      user.password = hashedPassword;
      user.name = userDef.name;
      user.roleId = assignedRole.id;
      user.status = UserStatus.ACTIVE;
      user.canSignIn = true;
      const savedUser = await userRepository.save(user);

      // Обновляем телефоны для существующего пользователя (удаляем старые и создаем новые)
      const existingPhones = await phoneRepository.find({ where: { userId: savedUser.id } });
      if (existingPhones.length > 0) {
        await phoneRepository.remove(existingPhones);
      }
      const phones = generatePhones();
      const phoneEntities = phones.map(phoneData => 
        phoneRepository.create({
          userId: savedUser.id,
          number: phoneData.number,
          isPrimary: phoneData.isPrimary,
        })
      );
      await phoneRepository.save(phoneEntities);
      user = savedUser;
    }

    createdUsers[userDef.email] = user;

    if (userDef.email.endsWith('@demo.io')) {
      console.log(`✅ Created mock admin user: ${userDef.email}`);
    }
  }

  console.log(`\n✅ Created/updated ${Object.keys(createdUsers).length} admin users (including ${mockAdminCount} mock admins)`);
  console.log('\n💡 Default admin users credentials:');
  console.log('   - jc@crm.com / 222222@A');
  console.log('   - vitaly@crm.com / 222222@A');
  console.log('   - test2@test.test / 222222@A');
  console.log(`\n💡 Mock admin users use password: ${mockAdminPassword}`);
  console.log('\n🎉 Admin users seed completed!');
}

