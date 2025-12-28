'use client';

import React from 'react';
import { Card } from '@/app/components/ui/card';
import { RoleCardViewProps } from './role-card-view.types';
import { RoleCardViewTitle } from './role-card-view-title';
import { useRoles } from '@/lib/store/hooks/roles.hooks';

export const RoleCardView: React.FC<RoleCardViewProps> = ({
  id,
  name,
  description,
  icon: Icon,
  rolePermissions = [],
  isSystem = false,
}) => {
  const { fetchRoles } = useRoles();

  // Обработчик успешного обновления/удаления
  const handleSuccess = React.useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <Card className="w-full">
      <RoleCardViewTitle
        id={id}
        name={name}
        description={description}
        icon={Icon}
        isSystem={isSystem}
        rolePermissions={rolePermissions}
        onDeleteSuccess={handleSuccess}
      />
    </Card>
  );
};

