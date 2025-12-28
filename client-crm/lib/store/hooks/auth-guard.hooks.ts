import { apiClient } from '@/lib/store/api/auth.api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from './auth.hooks';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { redirectTo = '/login', requireAuth = true } = options;
  const { isAuthenticated, isLoading, getProfile, accessToken } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Проверяем токен из localStorage (для первого рендера) или из Redux store
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || accessToken
        : accessToken;

      if (requireAuth) {
        // Для приватных страниц - проверяем аутентификацию
        if (!token) {
          // Нет accessToken — пробуем тихо обновить по refresh cookie
          try {
            const refreshResponse = await apiClient.post('/api/auth/refresh-tokens');
            const newAccess = refreshResponse?.data?.accessToken as string | undefined;
            if (newAccess) {
              localStorage.setItem('accessToken', newAccess);
            }
          } catch {
            router.push(redirectTo);
            setIsChecking(false);
            return;
          }
        }

        // Если токен есть, но еще не проверили через getProfile
        if (token && !isAuthenticated && !isLoading) {
          try {
            await getProfile();
            // После успешного getProfile isAuthenticated станет true
          } catch (error) {
            console.error('Auth check failed:', error);
            // Очищаем accessToken (refreshToken cookie удаляется сервером при ошибке)
            localStorage.removeItem('accessToken');
            router.push(redirectTo);
            setIsChecking(false);
            return;
          }
        }
      } else {
        // Для публичных страниц (например /login, /forgot, /reset-password)
        if (token) {
          // Если токен есть, но еще не проверили валидность
          if (!isAuthenticated && !isLoading) {
            try {
              await getProfile();
              // Если getProfile успешен, редиректим на приватную страницу
              router.push('/chat');
              return;
            } catch (error) {
              // Токен невалидный, очищаем и остаемся на публичной странице
              console.error('Token validation failed:', error);
              localStorage.removeItem('accessToken');
              setIsChecking(false);
              return;
            }
          }

          // Если уже авторизован (isAuthenticated === true), редиректим
          if (isAuthenticated) {
            router.push('/chat');
            return;
          }
        }
        // Для публичных страниц без токена - не делаем refresh, просто остаемся на странице
        // Это предотвращает лишние запросы refresh-token для страниц forgot/reset password
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, accessToken, getProfile, router]);

  return {
    isChecking,
    isAuthenticated,
    isLoading,
  };
};
