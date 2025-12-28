'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthGuard } from '@/lib/store/hooks/auth-guard.hooks';
import { usePermissions } from '@/lib/store/hooks/permissions.hooks';
import { canAccessRoute } from '@/lib/utils/route-permissions.utils';
import type { RouteGuardProps } from './route-guard.types';

/**
 * RouteGuard - автоматически защищает маршрут на основе URL и permissions пользователя
 * 
 * Отличается от ProtectedRoute:
 * - ProtectedRoute требует явного указания requiredPermissions
 * - RouteGuard автоматически определяет требуемый permission по URL через canAccessRoute()
 * 
 * Follows SOLID: Single Responsibility
 * Follows GRASP: Information Expert (использует canAccessRoute для определения permission)
 */
export const RouteGuard = ({ 
  children, 
  redirectTo = '/chat',
  fallback
}: RouteGuardProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isChecking, isAuthenticated } = useAuthGuard({ requireAuth: true });
  const { permissions } = usePermissions();

  useEffect(() => {
    // Ждем завершения проверки аутентификации
    if (!isAuthenticated || isChecking) return;

    // Автоматически проверяем доступ к текущему URL
    // canAccessRoute определяет требуемый permission на основе URL_RESOURCE_MAP
    const hasAccess = canAccessRoute(pathname, permissions);
    
    if (!hasAccess) {
      console.warn('🚫 Access denied to:', pathname, 'Required permissions:', permissions);
      router.push(redirectTo);
    }
  }, [pathname, isAuthenticated, isChecking, permissions, router, redirectTo]);

  // Показываем loader во время проверки аутентификации
  if (isChecking) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Если не залогинен - useAuthGuard уже редиректит на /login
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

