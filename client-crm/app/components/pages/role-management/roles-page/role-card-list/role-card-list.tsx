'use client';

import React from 'react';
import { RoleCardView } from './role-card-view';
import type { RoleCardListProps } from './role-card-list.types';
import { getRoleIcon } from '../roles-page.constants';


export const RoleCardList: React.FC<RoleCardListProps> = ({ roles }) => {
  // Фильтруем роль Owner - она не должна отображаться в списке role-management
  const filteredRoles = roles.filter(role => role.name.toLowerCase() !== 'owner');
  
  if (filteredRoles.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {filteredRoles.map((role) => (
        <RoleCardView
          key={role.id}
          id={role.id}
          name={role.name}
          description={role.description}
          icon={getRoleIcon(role.name)}
          rolePermissions={role.permissions}
          isSystem={role.isSystem}
        />
      ))}
    </div>
  );
};

