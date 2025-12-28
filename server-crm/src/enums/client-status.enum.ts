/**
 * Client status enum - статусы клиентов
 * 
 * ACTIVE - активный клиент, может входить в портал (если canSignIn = true)
 * SUSPENDED - приостановлен, может быть восстановлен, вход в портал заблокирован
 * ARCHIVED - архивирован, не может быть восстановлен, email хранится для истории
 */
export enum ClientStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

/**
 * Array of all client statuses
 */
export const CLIENT_STATUSES = Object.values(ClientStatus);

/**
 * Check if status is valid
 */
export function isValidClientStatus(status: string): boolean {
  return CLIENT_STATUSES.includes(status as ClientStatus);
}

