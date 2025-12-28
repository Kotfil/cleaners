import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../index';
import { fetchPermissions } from '../slices/permissions-slice/permissions-slice';

/**
 * Hook for working with permissions data (not to be confused with usePermissions for checking permissions)
 */
export const usePermissionsData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, loading, error } = useSelector((state: RootState) => state.permissions);

  // Мемоизируем функцию для избежания бесконечных циклов рендеринга
  const handleFetchPermissions = useCallback(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  return {
    permissions,
    loading,
    error,
    fetchPermissions: handleFetchPermissions,
  };
};

