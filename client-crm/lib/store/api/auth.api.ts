import axios from 'axios';
import { SignInRequest, SignInResponse, SignUpRequest, RefreshTokenRequest, RefreshTokenResponse, PasswordRequirementsResponse } from '../types/auth.types';
import { env } from '../../config/env';
import { log } from 'console';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Interceptor для добавления токена в запросы
apiClient.interceptors.request.use(
  (config) => {
    // Публичные эндпоинты не требуют токена
    const isPublicEndpoint = config.url?.includes('/sign-in') || 
                            config.url?.includes('/sign-up') ||
                            config.url?.includes('/sign-up-with-token') ||
                            config.url?.includes('/refresh-tokens') ||
                            config.url?.includes('/forgot-password') ||
                            config.url?.includes('/reset-password') ||
                            config.url?.includes('/captcha-status') ||
                            config.url?.includes('/password-requirements') ||
                            config.url?.includes('/validate-invite-token') ||
                            config.url?.includes('/get-invite-email');
    
    // Добавляем токен только для защищенных эндпоинтов
    if (!isPublicEndpoint) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor для обработки ответов и обновления токенов
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    // Не пытаемся обновить токены для эндпоинтов авторизации и публичных эндпоинтов
    const isAuthEndpoint = originalRequest.url?.includes('/sign-in') || 
                          originalRequest.url?.includes('/sign-up') ||
                          originalRequest.url?.includes('/sign-up-with-token') ||
                          originalRequest.url?.includes('/refresh-tokens') ||
                          originalRequest.url?.includes('/forgot-password') ||
                          originalRequest.url?.includes('/reset-password');
    
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !isAuthEndpoint) {
      
      originalRequest._retry = true;
      
      try {
        console.log('🔄 Attempting to refresh token...');
        console.log('📍 Refresh URL:', `${env.apiUrl}/api/auth/refresh-tokens`);
        
        // RefreshToken ТОЛЬКО из cookie (withCredentials: true автоматически отправляет cookie)
        console.log('🍪 Cookies:', document.cookie);
        console.log('🔧 WithCredentials: true - отправляем cookies');
        
        // Используем apiClient - он автоматически отправит cookie с refreshToken
        const refreshResponse = await apiClient.post(
          '/api/auth/refresh-tokens'
        );

        console.log('✅ Refresh успешен! Response:', refreshResponse.data);
        console.log('📊 Новый accessToken получен',refreshResponse);
        const { accessToken } = refreshResponse.data;
        
        // Сохраняем только access token
        localStorage.setItem('accessToken', accessToken);
        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.withCredentials = true; // Убедимся что credentials отправляются
        console.log('🔄 Повторяю оригинальный запрос с новым токеном');
        
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error('❌ Ошибка обновления токена:', refreshError);
        console.error('📊 Error response:', refreshError.response?.data);
        console.error('📊 Error status:', refreshError.response?.status);
        console.error('📊 Request headers:', refreshError.config?.headers);
        console.error('📊 Cookie was sent:', document.cookie);
        
        // Очищаем только accessToken, refreshToken в httpOnly cookie
        localStorage.removeItem('accessToken');
        
        // Если refresh отсутствует/просрочен — жёсткий редирект на /login
        const msg: string | undefined = refreshError?.response?.data?.message || refreshError?.message;
        const status: number | undefined = refreshError?.response?.status;
        const shouldRedirect = status === 401 || status === 400 || (typeof msg === 'string' && /refresh token/i.test(msg));
        if (shouldRedirect && typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  signIn: (credentials: SignInRequest) => 
    apiClient.post<SignInResponse>('/api/auth/sign-in', credentials),
  
  signUp: (userData: SignUpRequest) => 
    apiClient.post('/api/auth/sign-up', userData),
  
  refreshTokens: (tokenData: RefreshTokenRequest) => 
    apiClient.post<RefreshTokenResponse>('/api/auth/refresh-tokens', tokenData),
  
  logout: () => 
    apiClient.post('/api/auth/logout'),
  
  getProfile: () => 
    apiClient.get('/api/auth/profile'),
  
  forgotPassword: (email: string) => 
    apiClient.post('/api/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string, confirmPassword: string) => 
    apiClient.post('/api/auth/reset-password', { token, password, confirmPassword }),
  
  signUpWithToken: (data: {
    token: string;
    email: string;
    name?: string;
    password: string;
    confirmPassword: string;
    role: string;
    phones?: Array<{ number: string; isPrimary?: boolean }>;
  }) => 
    apiClient.post('/api/auth/sign-up-with-token', data),
  
  validateInviteToken: (token: string) =>
    apiClient.get<{ valid: boolean }>(`/api/auth/validate-invite-token?token=${encodeURIComponent(token)}`),
  
  getInviteEmail: (token: string) =>
    apiClient.get<{ email: string }>(`/api/auth/get-invite-email?token=${encodeURIComponent(token)}`),
  
  inviteUser: (email: string, role: string) =>
    apiClient.post<{ message: string }>('/api/auth/invite-user', { email, role }),
  
  // Get password requirements from server for sync validation
  getPasswordRequirements: () =>
    apiClient.get<PasswordRequirementsResponse>('/api/auth/password-requirements'),
};

export { apiClient };
