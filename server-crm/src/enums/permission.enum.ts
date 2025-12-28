/**
 * Permission enum - СТАТИЧЕСКИЕ permissions для всех ресурсов
 * 
 * ⚠️ ВАЖНО: Permissions фиксированные и создаются только через seed!
 * - Создание: yarn seed:permissions (при старте приложения)
 * - API: только READ (GET /api/permissions)
 * - Нельзя создавать новые через UI/API
 * 
 * Соответствует страницам в приложении
 * Follows SOLID: Single Responsibility (только определение permissions)
 */
export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Company Team Management
  COMPANY_TEAM_READ = 'company-team:read',
  
  // Role Management
  ROLE_MANAGEMENT_CREATE = 'role-management:create',
  ROLE_MANAGEMENT_READ = 'role-management:read',
  ROLE_MANAGEMENT_UPDATE = 'role-management:update',
  
  // Client Management (clients, chat)
  CLIENT_CREATE = 'client:create',
  CLIENT_READ = 'client:read',
  CLIENT_UPDATE = 'client:update',
  CLIENT_DELETE = 'client:delete',
  
  // Chat Management
  CHAT_READ = 'chat:read',
  
  // Order Management
  ORDER_READ = 'order:read',
  
  // Quotes Management
  QUOTES_READ = 'quotes:read',
  
  // Calendar Management
  CALENDAR_READ = 'calendar:read',
  
  // My Cleaning Day Management
  MY_CLEANING_DAY_READ = 'my-cleaning-day:read',
  
  // Pricing Management
  PRICING_CREATE = 'pricing:create',
  PRICING_READ = 'pricing:read',
  PRICING_UPDATE = 'pricing:update',
  PRICING_DELETE = 'pricing:delete',
  
  // Money Flow Management
  MONEY_FLOW_READ = 'money-flow:read',
  
  // Reports (search)
  REPORTS_READ = 'reports:read',
  
  // Settings
  SETTINGS_READ = 'settings:read',
}
