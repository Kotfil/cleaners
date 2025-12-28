'use client';

import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { usePermissionsData } from '@/lib/store/hooks/permissions-data.hooks';
import React, { useEffect, useMemo } from 'react';
import type { ViewRolePermissionsProps } from './view-role-permissions.types';

// Dialog для просмотра permissions роли (read-only)
export const ViewRolePermissions: React.FC<ViewRolePermissionsProps> = React.memo(({
  open,
  onOpenChange,
  roleId,
  roleName,
  rolePermissions = [],
}) => {
  const { permissions, fetchPermissions, loading } = usePermissionsData();

  // Загружаем permissions при открытии Dialog
  useEffect(() => {
    if (open && permissions.length === 0) {
      fetchPermissions();
    }
  }, [open, permissions.length, fetchPermissions]);

  // Группируем permissions по ресурсам и фильтруем только CRUD операции
  // Исключаем role-management для всех ролей кроме Owner - этот permission только для Owner
  const groupedPermissions = useMemo(() => {
    const crudActions = ['create', 'read', 'update', 'delete'];
    const isOwner = roleName?.toLowerCase() === 'owner';
    const filtered = permissions.filter(
      p => crudActions.includes(p.action) && (isOwner || p.resource !== 'role-management')
    );
    
    return filtered.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = {};
      }
      acc[permission.resource][permission.action] = permission;
      return acc;
    }, {} as Record<string, Record<string, typeof permissions[0]>>);
  }, [permissions, roleName]);

  // Сортируем ресурсы по количеству permissions (от большего к меньшему)
  const sortedResources = useMemo(() => {
    return Object.entries(groupedPermissions).sort(([, aPermissions], [, bPermissions]) => {
      const aCount = Object.keys(aPermissions).length;
      const bCount = Object.keys(bPermissions).length;
      return bCount - aCount;
    });
  }, [groupedPermissions]);

  // Функция для отображения action
  const getActionLabel = (action: string): string => {
    if (action === 'read') return 'View';
    if (action === 'update') return 'Edit';
    return action;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>View Permissions: {roleName}</DialogTitle>
            <DialogDescription>
              Current permissions assigned to this role.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading permissions...</div>
          ) : (
            <div className="h-full flex flex-col space-y-3">
              <Label>Permissions</Label>
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-3">
                  {sortedResources.map(([resource, resourcePermissionsMap]) => {
                    const crudActions = ['create', 'read', 'update', 'delete'] as const;

                    return (
                      <div key={resource} className="border rounded-lg p-3 flex flex-col">
                        <Label className="text-sm font-semibold capitalize block mb-2">
                          {resource}
                        </Label>
                        <div className="flex flex-wrap justify-between gap-y-2">
                          {crudActions.map((action) => {
                            const permission = resourcePermissionsMap[action];
                            if (!permission) return null;
                            
                            return (
                              <div key={permission.id} className="flex items-center space-x-1.5">
                                <Checkbox
                                  id={`permission-view-${permission.id}`}
                                  checked={rolePermissions.includes(permission.id)}
                                  disabled
                                  className="cursor-not-allowed"
                                />
                                <Label
                                  htmlFor={`permission-view-${permission.id}`}
                                  className="text-xs font-normal capitalize cursor-not-allowed opacity-70"
                                >
                                  {getActionLabel(action)}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

ViewRolePermissions.displayName = 'ViewRolePermissions';

