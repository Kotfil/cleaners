'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/hooks/auth.hooks';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getProfile, accessToken } = useAuth();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Проверяем токен из localStorage или Redux store
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('accessToken') || accessToken 
        : accessToken;

      if (!token) {
        // Нет токена - редирект на /login
        router.push('/login');
        return;
      }

      // Токен есть - проверяем валидность через getProfile
      if (!isAuthenticated && !isLoading) {
        try {
          await getProfile();
          // После успешного getProfile isAuthenticated станет true
          router.push('/chat');
        } catch (error) {
          // Токен невалидный - очищаем и редирект на /login
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          router.push('/login');
        }
        return;
      }

      // Если уже проверено и авторизован - редирект на /chat
      if (isAuthenticated && !isLoading) {
        router.push('/chat');
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, isLoading, accessToken, getProfile, router]);

  // Показываем загрузку пока проверяем аутентификацию
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
