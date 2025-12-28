import { DataSource } from 'typeorm';

/**
 * Seed script for application settings
 * 
 * Создает базовые настройки приложения при инициализации БД
 * 
 * Run: через yarn seed:all или отдельно
 * 
 * Features:
 * - Создает таблицу settings если её нет
 * - Добавляет базовые настройки системы
 */
export async function seedSettings(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting settings seed...');

  try {
    // Проверяем, существует ли таблица settings
    const tableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'settings'
      );
    `);

    if (!tableExists[0].exists) {
      console.log('📋 Creating settings table...');
      
      // Создаем таблицу settings
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          category VARCHAR(100) DEFAULT 'general',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
        CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
      `);
      
      console.log('✅ Settings table created!');
    }

    // Базовые настройки приложения
    const defaultSettings = [
      {
        key: 'app.name',
        value: 'Cleaners CRM',
        description: 'Application name',
        category: 'general',
      },
      {
        key: 'app.version',
        value: '1.0.0',
        description: 'Application version',
        category: 'general',
      },
      {
        key: 'app.timezone',
        value: 'America/New_York',
        description: 'Default timezone',
        category: 'general',
      },
      {
        key: 'app.language',
        value: 'en',
        description: 'Default language',
        category: 'general',
      },
      {
        key: 'email.from',
        value: 'noreply@cleanerscrm.com',
        description: 'Default email sender address',
        category: 'email',
      },
      {
        key: 'email.from_name',
        value: 'Cleaners CRM',
        description: 'Default email sender name',
        category: 'email',
      },
      {
        key: 'pagination.default_page_size',
        value: '20',
        description: 'Default items per page',
        category: 'pagination',
      },
      {
        key: 'pagination.max_page_size',
        value: '100',
        description: 'Maximum items per page',
        category: 'pagination',
      },
      {
        key: 'security.password_min_length',
        value: '8',
        description: 'Minimum password length',
        category: 'security',
      },
      {
        key: 'security.session_timeout',
        value: '3600',
        description: 'Session timeout in seconds',
        category: 'security',
      },
    ];

    console.log(`📝 Inserting ${defaultSettings.length} default settings...`);

    for (const setting of defaultSettings) {
      await dataSource.query(
        `
        INSERT INTO settings (key, value, description, category, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = EXCLUDED.value,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          updated_at = CURRENT_TIMESTAMP;
        `,
        [setting.key, setting.value, setting.description, setting.category],
      );
    }

    console.log('✅ Settings seed completed!');
    console.log(`   - ${defaultSettings.length} settings created/updated`);
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  }
}

