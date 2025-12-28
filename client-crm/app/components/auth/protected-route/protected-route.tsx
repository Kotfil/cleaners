'use client';

import {useAuthGuard} from '@/lib/store/hooks/auth-guard.hooks';
import {usePermissions} from '@/lib/store/hooks/permissions.hooks';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requiredPermissions?: string | string[];
    redirectTo?: string; // Куда редиректить если нет прав
}

/**
 * Unified component for protecting routes
 * - Checks authentication first
 * - Then checks permissions (if provided)
 */
export const ProtectedRoute = ({
                                   children,
                                   fallback,
                                   requiredPermissions,
                                   redirectTo = '/chat'
                               }: ProtectedRouteProps) => {
    const router = useRouter();
    const {isChecking, isAuthenticated} = useAuthGuard({requireAuth: true});
    const {hasPermission, hasAllPermissions} = usePermissions();

    // Проверка permissions после успешной аутентификации
    useEffect(() => {
        if (!isAuthenticated || !requiredPermissions) return;

        const hasAccess = typeof requiredPermissions === 'string'
            ? hasPermission(requiredPermissions)
            : hasAllPermissions(requiredPermissions);

        if (!hasAccess) {
            console.warn('🚫 Access denied. Missing permissions:', requiredPermissions);
            router.push(redirectTo);
        }
    }, [isAuthenticated, requiredPermissions, hasPermission, hasAllPermissions, router, redirectTo]);

    // Показываем loader во время проверки аутентификации
    if (isChecking) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Если не залогинен - useAuthGuard уже редиректит
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};
