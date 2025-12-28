import { registerAs } from '@nestjs/config';

/**
 * JWT Configuration
 * 
 * Переменные окружения:
 * - JWT_SECRET: секретный ключ для подписи токенов
 * - JWT_TOKEN_AUDIENCE: аудитория токена (по умолчанию 'jeny-crm')
 * - JWT_TOKEN_ISSUER: издатель токена (по умолчанию 'jeny-crm')
 * - JWT_ACCESS_TOKEN_TTL: время жизни access token в секундах (по умолчанию 7200 = 2 часа)
 * - JWT_REFRESH_TOKEN_TTL: время жизни refresh token в секундах (по умолчанию 604800 = 7 дней)
 * 
 * Пример в .env:
 * JWT_ACCESS_TOKEN_TTL=7200
 * JWT_REFRESH_TOKEN_TTL=604800
 */
export default registerAs('jwt', () => {
  const accessTokenTtl = process.env.JWT_ACCESS_TOKEN_TTL 
    ? parseInt(process.env.JWT_ACCESS_TOKEN_TTL, 10) 
    : 7200; // 2 hours default
  
  const refreshTokenTtl = process.env.JWT_REFRESH_TOKEN_TTL 
    ? parseInt(process.env.JWT_REFRESH_TOKEN_TTL, 10) 
    : 604800; // 7 days default

  // Логируем загруженные значения (без секретов)
  console.log('🔐 JWT Configuration loaded:', {
    hasSecret: !!process.env.JWT_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE || 'jeny-crm',
    issuer: process.env.JWT_TOKEN_ISSUER || 'jeny-crm',
    accessTokenTtl: `${accessTokenTtl}s (${(accessTokenTtl / 3600).toFixed(1)}h)`,
    refreshTokenTtl: `${refreshTokenTtl}s (${(refreshTokenTtl / 86400).toFixed(1)}d)`,
    accessTokenTtlFromEnv: process.env.JWT_ACCESS_TOKEN_TTL || 'not set (using default)',
    refreshTokenTtlFromEnv: process.env.JWT_REFRESH_TOKEN_TTL || 'not set (using default)',
  });

  return {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    audience: process.env.JWT_TOKEN_AUDIENCE || 'jeny-crm',
    issuer: process.env.JWT_TOKEN_ISSUER || 'jeny-crm',
    accessTokenTtl,
    refreshTokenTtl,
  };
});
