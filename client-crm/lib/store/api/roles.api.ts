import { apiClient } from './auth.api';
import {
  Role,
  RoleCounts,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest
} from '../slices/roles-slice/roles-slice.types';

export const rolesApi = {
  // Получить все роли
  getRoles: () =>
    apiClient.get<Role[]>('/api/roles'),

  // Получить роль по ID
  getRole: (id: string) =>
    apiClient.get<Role>(`/api/roles/${id}`),

  // Создать роль
  createRole: (roleData: CreateRoleRequest) =>
    apiClient.post<Role>('/api/roles', roleData),

  // Обновить роль
  updateRole: (id: string, roleData: UpdateRoleRequest) =>
    apiClient.put<Role>(`/api/roles/${id}`, roleData),

  // Удалить роль
  deleteRole: (id: string) =>
    apiClient.delete(`/api/roles/${id}`),

  // Назначить разрешения роли
  assignPermissions: (id: string, permissionsData: AssignPermissionsRequest) =>
    apiClient.post(`/api/roles/${id}/permissions`, permissionsData),

  // Получить пользователей по роли
  getUsersByRole: (id: string) =>
    apiClient.get(`/api/roles/${id}/users`),

  // Получить каунты ролей
  getRoleCounts: () =>
    apiClient.get<RoleCounts>('/api/roles/counts'),
};
