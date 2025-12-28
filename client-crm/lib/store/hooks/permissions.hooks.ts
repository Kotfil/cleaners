import { useSelector } from 'react-redux';
import { RootState } from '../index';

/**
 * Hook for checking user permissions
 * Uses permissions from Redux auth state
 * Follows SOLID and GRASP principles
 */
export const usePermissions = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const permissions = user?.permissions || [];
  
  /**
   * Check if user has a specific permission
   * @param permission - Permission string (e.g., 'user:create')
   * @returns boolean
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  /**
 * Check if user has any of the provided permissions
   * @param perms - Array of permission strings
   * @returns boolean
   */
  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(p => permissions.includes(p));
  };

  /**
   * Check if user has all of the provided permissions
   * @param perms - Array of permission strings
   * @returns boolean
   */
  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every(p => permissions.includes(p));
  };

  /**
   * Check if user has a specific role (dynamic check)
   * @param role - Role name to check
   * @returns boolean
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
};