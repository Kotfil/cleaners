'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Settings } from 'lucide-react';
import { UpdateRolePermissions } from '../update-role-permissions';
import { usePermissionsData } from '@/lib/store/hooks/permissions-data.hooks';
import { useRoles } from '@/lib/store/hooks/roles.hooks';
import { usePermissions } from '@/lib/store/hooks/permissions.hooks';
import type { UpdateRolePermissionsButtonProps } from './update-role-permissions-button.types';


export const UpdateRolePermissionsButton: React.FC<UpdateRolePermissionsButtonProps> = ({
  roleId,
  roleName,
  rolePermissions = [],
  onSuccess,
}) => {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const { permissions: allPermissions, fetchPermissions } = usePermissionsData();
  const { fetchRoles } = useRoles();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('role-management:update');

  // Загружаем permissions если они не загружены
  React.useEffect(() => {
    if (allPermissions.length === 0) {
      fetchPermissions();
    }
  }, [allPermissions.length, fetchPermissions]);

  // Обработчик успешного обновления permissions
  const handleUpdateSuccess = useCallback(() => {
    fetchRoles();
    setUpdateDialogOpen(false);
    onSuccess?.();
  }, [fetchRoles, onSuccess]);

  // Преобразуем permission names в permission IDs
  const permissionIds = useMemo(() => {
    if (!rolePermissions.length || !allPermissions.length) return [];
    return allPermissions
      .filter(p => rolePermissions.includes(p.name))
      .map(p => p.id);
  }, [rolePermissions, allPermissions]);

  if (!canUpdate) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setUpdateDialogOpen(true)}
        className="h-8 w-8 p-0"
        title="Update Permissions"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <UpdateRolePermissions
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        roleId={roleId}
        roleName={roleName}
        rolePermissions={permissionIds}
        onSuccess={handleUpdateSuccess}
      />
    </>
  );
};

