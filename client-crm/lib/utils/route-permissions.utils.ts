/**
 * Utility for dynamic route-to-resource mapping
 * Синхронизировано с permissions в БД
 * Follows SOLID: Single Responsibility, Open/Closed
 */

// Базовый маппинг URL → resource (синхронизирован с sidebar и permissions)
const URL_RESOURCE_MAP: Record<string, string> = {
  // User Management
  '/users': 'user',
  '/company-team': 'company-team',
  '/role-management': 'role-management',
  
  // Client Management
  '/clients': 'client',
  '/chat': 'chat',
  
  // Order Management
  '/orders': 'order',
  '/quotes': 'quotes',
  
  // Calendar Management
  '/calendar': 'calendar',
  '/my-cleaning-day': 'my-cleaning-day',
  
  // Pricing Management
  '/pricing': 'pricing',
  
  // Money Flow Management
  '/money-flow': 'money-flow',
  
  // Reports
  '/search': 'reports',
  
  // Settings
  '/settings': 'settings',
};

// Страницы доступные всем авторизованным пользователям
const PUBLIC_AUTHENTICATED_PAGES: string[] = [];

// Особые случаи: страницы требующие конкретного action
const SPECIAL_ACTION_PAGES: Record<string, string> = {
  // Все новые страницы используют read по умолчанию
};

/**
 * Получить required permissions для страницы
 * @param url - URL страницы
 * @param userPermissions - массив permissions пользователя из JWT
 * @returns boolean - имеет ли доступ
 */
export const canAccessRoute = (url: string, userPermissions: string[]): boolean => {
  // Публичные страницы доступны всем
  if (PUBLIC_AUTHENTICATED_PAGES.includes(url)) {
    return true;
  }

  // Получаем resource для URL
  const resource = URL_RESOURCE_MAP[url];
  if (!resource) {
    // Если URL не в мапе - даем доступ (или можно false для безопасности)
    return true;
  }

  // Определяем required action (по умолчанию 'read')
  const requiredAction = SPECIAL_ACTION_PAGES[url] || 'read';
  const requiredPermission = `${resource}:${requiredAction}`;

  // Проверяем есть ли permission
  return userPermissions.includes(requiredPermission);
};

/**
 * Получить resource по URL
 * @param url - URL страницы
 * @returns resource name или null
 */
export const getResourceByUrl = (url: string): string | null => {
  return URL_RESOURCE_MAP[url] || null;
};

/**
 * Проверить доступ к нескольким permissions (AND logic)
 * @param requiredPermissions - массив требуемых permissions
 * @param userPermissions - массив permissions пользователя
 * @returns boolean
 */
export const hasAllPermissions = (
  requiredPermissions: string[],
  userPermissions: string[]
): boolean => {
  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );
};

/**
 * Проверить доступ хотя бы к одному permission (OR logic)
 * @param requiredPermissions - массив требуемых permissions
 * @param userPermissions - массив permissions пользователя
 * @returns boolean
 */
export const hasAnyPermission = (
  requiredPermissions: string[],
  userPermissions: string[]
): boolean => {
  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
};
