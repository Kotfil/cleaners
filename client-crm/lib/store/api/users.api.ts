import { apiClient } from './auth.api';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
} from '../types/users.types';
import { User, PaginatedResponse } from '../slices/users-slice/users-slice.types';

export const usersApi = {
  // Получить всех пользователей
  getUsers: (page: number = 1, limit: number = 10, status?: 'active' | 'suspended' | 'archived' | null) => {
    const statusParam = status ? `&status=${status}` : '';
    return apiClient.get<PaginatedResponse<User>>(`/api/users?page=${page}&limit=${limit}${statusParam}`);
  },
  
  // Получить пользователя по ID
  getUser: (id: string) => 
    apiClient.get<User>(`/api/users/${id}`),
  
  // Создать пользователя
  createUser: (userData: CreateUserRequest) => 
    apiClient.post<User>('/api/users', userData),
  
  // Обновить пользователя
  updateUser: (id: string, userData: UpdateUserRequest) => 
    apiClient.put<User>(`/api/users/${id}`, userData),
  
  // Удалить пользователя
  deleteUser: (id: string) => 
    apiClient.delete(`/api/users/${id}`),
  
  // Поиск пользователей
  searchUsers: (query: string, page: number = 1, limit: number = 10) => 
    apiClient.get<PaginatedResponse<User>>(
      `/api/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    ),
  
  // Получить пользователей по роли
  getUsersByRole: (role: string) => 
    apiClient.get<User[]>(`/api/users/role/${role}`),
  
  // Получить активных пользователей
  getActiveUsers: () => 
    apiClient.get<User[]>('/api/users/active/all'),
  
  // Проверить существование номера телефона
  checkPhoneExists: (phoneNumber: string, excludeUserId?: string) => {
    const excludeParam = excludeUserId ? `?excludeUserId=${excludeUserId}` : '';
    return apiClient.get<{ exists: boolean; userId?: string }>(
      `/api/users/check-phone/${encodeURIComponent(phoneNumber)}${excludeParam}`
    );
  },
};
