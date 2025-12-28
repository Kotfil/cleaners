import { DataSource } from 'typeorm';
import { Client } from '../../entities/client.entity';
import { ClientPhone } from '../../entities/client-phone.entity';

/**
 * Seed script for MOCK clients
 * 
 * Создает моковых клиентов для тестирования и разработки
 * Генерирует случайные данные на основе предопределенных списков
 * 
 * Run: yarn seed:clients или через yarn seed:all
 * 
 * Features:
 * - Генерирует случайные имена из предопределенных списков
 * - Создает уникальные email адреса
 * - Генерирует 1-10 телефонных номеров на клиента
 * - Добавляет случайные адреса (street, city, state, zipCode)
 * - Опциональные notes
 */
export async function seedClients(dataSource: DataSource, count: number = 50): Promise<void> {
  const clientRepository = dataSource.getRepository(Client);
  const phoneRepository = dataSource.getRepository(ClientPhone);

  console.log(`🌱 Starting clients seed (${count} clients)...`);

  // Предопределенные данные для генерации
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
    'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Jennifer', 'Daniel',
    'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Karen', 'Mark', 'Helen', 'Donald', 'Sandra'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
  ];

  const domains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com',
    'business.org', 'corp.net', 'enterprise.com', 'firm.co', 'group.io'
  ];

  const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
    'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit'
  ];

  const states = [
    'NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA',
    'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL'
  ];

  const streetNames = [
    'Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Maple Dr', 'Elm St',
    'First Ave', 'Second St', 'Park Rd', 'Washington St', 'Lincoln Ave',
    'Jefferson St', 'Madison Ave', 'Franklin St', 'Church St', 'School St'
  ];

  /**
   * Генерирует случайный телефонный номер в формате +1XXXXXXXXXX (12 символов: +1 + 10 цифр)
   */
  function generateRandomPhone(): string {
    const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
    return `+1${digits}`;
  }

  /**
   * Генерирует массив телефонов (1-10 штук)
   */
  function generatePhones(): Array<{ number: string; isPrimary: boolean }> {
    const phoneCount = Math.floor(Math.random() * 10) + 1; // 1 to 10 phones
    const phones: Array<{ number: string; isPrimary: boolean }> = [];
    
    for (let i = 0; i < phoneCount; i++) {
      phones.push({
        number: generateRandomPhone(),
        isPrimary: i === 0 // Первый телефон всегда primary
      });
    }
    
    return phones;
  }

  /**
   * Генерирует случайный email
   */
  function generateRandomEmail(firstName: string, lastName: string): string {
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const variations = [
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
      `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${domain}`
    ];
    const baseEmail = variations[Math.floor(Math.random() * variations.length)];
    // Добавляем timestamp для уникальности
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${baseEmail.split('@')[0]}${timestamp}${randomSuffix}@${baseEmail.split('@')[1]}`;
  }

  /**
   * Генерирует случайный адрес
   */
  function generateRandomAddress(): { street?: string; city?: string; state?: string; zipCode?: string } {
    const hasStreet = Math.random() > 0.3;
    const hasCity = Math.random() > 0.2;
    const hasState = Math.random() > 0.2;
    const hasZipCode = Math.random() > 0.3;

    return {
      street: hasStreet ? `${Math.floor(Math.random() * 9999) + 1} ${streetNames[Math.floor(Math.random() * streetNames.length)]}` : undefined,
      city: hasCity ? cities[Math.floor(Math.random() * cities.length)] : undefined,
      state: hasState ? states[Math.floor(Math.random() * states.length)] : undefined,
      zipCode: hasZipCode ? String(Math.floor(Math.random() * 90000) + 10000) : undefined,
    };
  }

  let created = 0;
  let errors = 0;

  // Генерируем и создаем клиентов
  for (let i = 0; i < count; i++) {
    try {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const email = generateRandomEmail(firstName, lastName);
      const phones = generatePhones();
      const address = generateRandomAddress();
      const hasNotes = Math.random() > 0.5;

      // Создаем клиента
      const client = clientRepository.create({
        email,
        name: fullName,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        countryCode: address.state ? 'US' : undefined,
        notes: hasNotes ? `Notes for ${fullName}` : undefined,
        isActive: true,
      });

      const savedClient = await clientRepository.save(client);

      // Создаем телефоны
      const phoneEntities = phones.map(phoneData => 
        phoneRepository.create({
          clientId: savedClient.id,
          number: phoneData.number,
          isPrimary: phoneData.isPrimary,
        })
      );

      await phoneRepository.save(phoneEntities);

      created++;

      if ((i + 1) % 10 === 0) {
        console.log(`   ✅ Created ${i + 1}/${count} clients...`);
      }
    } catch (error: any) {
      errors++;
      console.error(`   ❌ Error creating client ${i + 1}:`, error.message);
      
      // Если ошибка из-за дубликата email, продолжаем
      if (error.code === '23505' || error.message?.includes('unique')) {
        // Пропускаем этот клиент
        continue;
      }
      
      // Для других ошибок можно решить, продолжать или остановиться
      // Пока продолжаем
    }
  }

  console.log(`\n✅ Clients seed completed!`);
  console.log(`   Created: ${created}/${count}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }
}

