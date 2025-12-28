/**
 * Types for RouteGuard component
 */

export interface RouteGuardProps {
  children: React.ReactNode;
  redirectTo?: string; // Куда редиректить если нет доступа (по умолчанию '/chat')
  fallback?: React.ReactNode; // Что показывать во время проверки
}

