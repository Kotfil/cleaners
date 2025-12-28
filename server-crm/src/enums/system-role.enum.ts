/**
 * System roles enum - базовые фиксированные роли
 * 
 * ⚠️ ВАЖНО: Эти роли создаются при инициализации БД
 * - Создание: yarn seed:permissions (автоматически создает базовые роли)
 * - Нельзя удалить через UI/API (isSystem = true)
 * - Owner: нельзя изменять через UI/API, имеет все permissions, скрыт из списка role-management
 * - Admin, Manager, Cleaner: можно редактировать их permissions
 * 
 * Остальные роли создаются динамически через UI (полный CRUD)
 */
export enum SystemRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  CLEANER = 'cleaner',
}

/**
 * Array of all system roles
 */
export const SYSTEM_ROLES = Object.values(SystemRole);

/**
 * Check if role name is a system role
 */
export function isSystemRole(roleName: string): boolean {
  return SYSTEM_ROLES.includes(roleName as SystemRole);
}

