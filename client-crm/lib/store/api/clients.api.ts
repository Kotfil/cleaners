import { apiClient } from './auth.api';
import { 
  CreateClientRequest, 
  UpdateClientRequest, 
  ClientsResponse, 
  ClientResponse,
  SearchClientsRequest,
  SearchClientsResponse 
} from '../types/clients.types';
import { Client, PaginatedResponse } from '../slices/clients-slice/clients-slice.types';

export const clientsApi = {
  // Получить всех клиентов с пагинацией
  getClients: (page: number = 1, limit: number = 10, status?: 'active' | 'suspended' | 'archived' | null) => {
    const statusParam = status ? `&status=${status}` : '';
    return apiClient.get<PaginatedResponse<Client>>(`/api/clients?page=${page}&limit=${limit}${statusParam}`);
  },
  
  // Получить клиента по ID
  getClient: (id: string) => 
    apiClient.get<ClientResponse>(`/api/clients/${id}`),
  
  // Создать клиента
  createClient: (clientData: CreateClientRequest) => 
    apiClient.post<ClientResponse>('/api/clients', clientData),
  
  // Обновить клиента
  updateClient: (id: string, clientData: Partial<CreateClientRequest>) => 
    apiClient.put<ClientResponse>(`/api/clients/${id}`, clientData),
  
  // Удалить клиента
  deleteClient: (id: string) => 
    apiClient.delete(`/api/clients/${id}`),
  
  // Поиск клиентов с пагинацией
  searchClients: (query: string, page: number = 1, limit: number = 10) => 
    apiClient.get<PaginatedResponse<Client>>(`/api/clients/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  
  // Получить активных клиентов
  getActiveClients: () => 
    apiClient.get<Client[]>('/api/clients/active/all'),
  
  // Пригласить клиента по email
  inviteClient: (email: string, role: string) => 
    apiClient.post<{ message: string }>('/api/auth/invite-user', { email, role }),
};
