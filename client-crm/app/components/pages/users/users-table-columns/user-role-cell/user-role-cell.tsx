import React, { memo, useMemo } from 'react';
import { UserRoleCellProps } from './user-role-cell.types';

export const UserRoleCell: React.FC<UserRoleCellProps> = memo(({ user }) => {
  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'manager':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'lawyer':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accountant':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'cleaner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Собираем все роли пользователя (primary + secondary)
  const allRoles = useMemo(() => {
    const roles: string[] = [];
    if (user.role?.name) {
      roles.push(user.role.name);
    }
    // Добавляем все secondary roles
    if (user.secondaryRoles && user.secondaryRoles.length > 0) {
      user.secondaryRoles.forEach(role => {
        if (role?.name) {
          roles.push(role.name);
        }
      });
    }
    return roles;
  }, [user.role, user.secondaryRoles]);

  // Защита от null/undefined roles
  if (allRoles.length === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        No Role
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {allRoles.map((roleName, index) => (
        <span
          key={`${roleName}-${index}`}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(roleName)}`}
        >
          {roleName.toLowerCase() === 'owner' ? "'" : roleName}
        </span>
      ))}
    </div>
  );
});

UserRoleCell.displayName = 'UserRoleCell';
