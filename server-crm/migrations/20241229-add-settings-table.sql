-- Migration: Add settings table for application configuration
-- Date: 2024-12-29
-- Description: Creates a settings table to store application-wide configuration

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Add comment to table
COMMENT ON TABLE settings IS 'Application-wide settings and configuration';
COMMENT ON COLUMN settings.key IS 'Unique setting key identifier';
COMMENT ON COLUMN settings.value IS 'Setting value (stored as text, can be JSON)';
COMMENT ON COLUMN settings.description IS 'Human-readable description of the setting';
COMMENT ON COLUMN settings.category IS 'Category for grouping related settings';

