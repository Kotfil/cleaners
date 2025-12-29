/**
 * User status enum - статусы пользователей
 * 
 * ACTIVE - активный пользователь, может входить в систему
 * SUSPENDED - приостановлен, может быть восстановлен, email остается действующим
 * ARCHIVED - архивирован, может быть восстановлен, email хранится для истории, но не действующий
 */
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

/**
 * Array of all user statuses
 */
export const USER_STATUSES = Object.values(UserStatus);

/**
 * Check if status is valid
 */
export function isValidUserStatus(status: string): boolean {
  return USER_STATUSES.includes(status as UserStatus);
}

