'use client';

import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { DeleteRoleButton } from '../delete-role-button';
import { UpdateRolePermissionsButton } from '../update-role-permissions-button';
import { ViewRolePermissionsButton } from '../view-role-permissions-button';
import type { RoleCardViewTitleProps } from './role-card-view-title.types';

// Заголовок карточки роли с кнопками действий
export const RoleCardViewTitle: React.FC<RoleCardViewTitleProps> = ({
  id,
  name,
  description,
  icon: Icon,
  isSystem,
  rolePermissions = [],
  onDeleteSuccess,
}) => {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl capitalize">{name}</CardTitle>
            <div className="flex items-center gap-1">
              <ViewRolePermissionsButton
                roleId={id}
                roleName={name}
                rolePermissions={rolePermissions}
              />
              <UpdateRolePermissionsButton
                roleId={id}
                roleName={name}
                rolePermissions={rolePermissions}
                onSuccess={onDeleteSuccess}
              />
              {!isSystem && (
                <DeleteRoleButton
                  roleId={id}
                  roleName={name}
                  onSuccess={onDeleteSuccess}
                />
              )}
            </div>
          </div>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
      </div>
    </CardHeader>
  );
};

