'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/store/api/auth.api';
import { PublicRouteProps } from './public-route.types';

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    // Проверяем только токен из URL (временный токен приглашения)
    if (token) {
      setIsValidating(true);
      authApi.validateInviteToken(token)
        .then((response) => {
          if (!response.data.valid) {
            router.push('/login');
          }
        })
        .catch(() => {
          router.push('/login');
        })
        .finally(() => {
          setIsValidating(false);
        });
    }
  }, [token, router]);

  if (isValidating) {
    return null;
  }

  return <>{children}</>;
};
