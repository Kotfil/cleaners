import { apiClient } from './auth.api';
import { Permission } from '../slices/permissions-slice/permissions-slice.types';

/**
 * API client for permissions
 * Follows SOLID: Single Responsibility, Dependency Inversion
 */
export const permissionsApi = {
  // Получить все permissions
  getAllPermissions: () =>
    apiClient.get<Permission[]>('/api/permissions'),

  // Получить permissions по ресурсу
  getPermissionsByResource: (resource: string) =>
    apiClient.get<Permission[]>(`/api/permissions/resource/${resource}`),

  // Получить маппинг роутов к permissions
  getRouteMappings: () =>
    apiClient.get<Record<string, string[]>>('/api/permissions/route-mappings'),
};

