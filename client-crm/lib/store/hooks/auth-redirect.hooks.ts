import { useAuth } from './auth.hooks';

/**
 * Хук для перенаправления авторизованных пользователей с публичных страниц
 */
export const useAuthRedirect = (redirectTo: string = '/chat') => {
  // const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Редирект закомментирован (не удалять)
  // useEffect(() => {
  //   if (!isLoading && isAuthenticated) {
  //     router.push(redirectTo);
  //   }
  // }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};
