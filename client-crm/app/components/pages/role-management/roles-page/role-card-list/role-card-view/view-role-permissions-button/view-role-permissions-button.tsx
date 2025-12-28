'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import { Eye } from 'lucide-react';
import { ViewRolePermissions } from '../view-role-permissions';
import { usePermissionsData } from '@/lib/store/hooks/permissions-data.hooks';
import type { ViewRolePermissionsButtonProps } from './view-role-permissions-button.types';

// Кнопка для просмотра permissions роли
export const ViewRolePermissionsButton: React.FC<ViewRolePermissionsButtonProps> = ({
  roleId,
  roleName,
  rolePermissions = [],
}) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { permissions: allPermissions, fetchPermissions } = usePermissionsData();

  // Загружаем permissions если они не загружены
  React.useEffect(() => {
    if (allPermissions.length === 0) {
      fetchPermissions();
    }
  }, [allPermissions.length, fetchPermissions]);

  // Преобразуем permission names в permission IDs
  const permissionIds = useMemo(() => {
    if (!rolePermissions.length || !allPermissions.length) return [];
    return allPermissions
      .filter(p => rolePermissions.includes(p.name))
      .map(p => p.id);
  }, [rolePermissions, allPermissions]);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setViewDialogOpen(true)}
        className="h-8 w-8 p-0"
        title="View Permissions"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <ViewRolePermissions
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        roleId={roleId}
        roleName={roleName}
        rolePermissions={permissionIds}
      />
    </>
  );
};

