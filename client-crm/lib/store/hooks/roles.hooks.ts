import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../index';
import {
  fetchRoles,
  fetchRoleCounts,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
} from '@/lib/store/slices/roles-slice';
import type { CreateRoleRequest, UpdateRoleRequest, AssignPermissionsRequest } from '@/lib/store/slices/roles-slice';

/**
 * Hook for working with roles
 */
export const useRoles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, counts, loading, error } = useSelector((state: RootState) => state.roles);

  // Мемоизируем функции для избежания бесконечных циклов рендеринга
  const handleFetchRoles = useCallback(() => {
    return dispatch(fetchRoles());
  }, [dispatch]);

  const handleFetchRoleCounts = useCallback(() => {
    return dispatch(fetchRoleCounts());
  }, [dispatch]);

  const handleFetchRole = useCallback((id: string) => {
    return dispatch(fetchRole(id));
  }, [dispatch]);

  const handleCreateRole = useCallback((roleData: CreateRoleRequest) => {
    return dispatch(createRole(roleData));
  }, [dispatch]);

  const handleUpdateRole = useCallback((id: string, roleData: UpdateRoleRequest) => {
    return dispatch(updateRole({ id, roleData }));
  }, [dispatch]);

  const handleDeleteRole = useCallback((id: string) => {
    return dispatch(deleteRole(id));
  }, [dispatch]);

  const handleAssignPermissions = useCallback((id: string, permissionsData: AssignPermissionsRequest) => {
    return dispatch(assignPermissions({ id, permissionsData }));
  }, [dispatch]);

  return {
    roles,
    counts,
    loading,
    error,
    fetchRoles: handleFetchRoles,
    fetchRoleCounts: handleFetchRoleCounts,
    fetchRole: handleFetchRole,
    createRole: handleCreateRole,
    updateRole: handleUpdateRole,
    deleteRole: handleDeleteRole,
    assignPermissions: handleAssignPermissions,
  };
};
