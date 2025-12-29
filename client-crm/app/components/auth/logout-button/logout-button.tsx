'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Spinner } from '@/app/components/ui/spinner';
import { useAuth } from '@/lib/store/hooks/auth.hooks';
import { LogoutButtonProps } from './logout-button.types';

export const LogoutButton = ({ className, children }: LogoutButtonProps) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Очищаем accessToken из localStorage (refreshToken cookie удаляется сервером)
      localStorage.removeItem('accessToken');
      // Перенаправляем на страницу логина
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если запрос не удался, очищаем accessToken
      localStorage.removeItem('accessToken');
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      disabled={isLoggingOut}
      className={className}
      variant="outline"
    >
      {isLoggingOut ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Выход...
        </>
      ) : (
        children || 'Выйти'
      )}
    </Button>
  );
};
