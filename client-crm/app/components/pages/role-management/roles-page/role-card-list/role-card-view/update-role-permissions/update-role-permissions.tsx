'use client';

import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { usePermissionsData } from '@/lib/store/hooks/permissions-data.hooks';
import { useRoles } from '@/lib/store/hooks/roles.hooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { UpdateRolePermissionsProps } from './update-role-permissions.types';


export const UpdateRolePermissions: React.FC<UpdateRolePermissionsProps> = React.memo(({
  open,
  onOpenChange,
  roleId,
  roleName,
  rolePermissions = [],
  onSuccess,
}) => {
  const { assignPermissions, loading: rolesLoading } = useRoles();
  const { permissions, fetchPermissions, loading: permissionsLoading } = usePermissionsData();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  // Загружаем permissions при открытии Dialog
  useEffect(() => {
    if (open && permissions.length === 0) {
      fetchPermissions();
    }
  }, [open, permissions.length, fetchPermissions]);

  // Инициализируем selected permissions при открытии Dialog
  // Используем useMemo для вычисления начального значения на основе rolePermissions
  const initialPermissionIds = useMemo(() => {
    if (!open || !roleId || permissions.length === 0) {
      return [];
    }
    return rolePermissions;
  }, [open, roleId, permissions.length, rolePermissions]);

  // Обновляем selectedPermissionIds только если initialPermissionIds изменился
  useEffect(() => {
    if (open && roleId && permissions.length > 0) {
      // Используем setTimeout для асинхронного обновления состояния
      const timer = setTimeout(() => {
        setSelectedPermissionIds(initialPermissionIds);
        setError(null);
        setIsLoadingRole(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, roleId, permissions.length, initialPermissionIds]);

  // Группируем permissions по ресурсам и фильтруем только CRUD операции
  // Исключаем role-management полностью - эти permissions только для Owner и не назначаются ролям
  const groupedPermissions = useMemo(() => {
    const crudActions = ['create', 'read', 'update', 'delete'];
    const filtered = permissions.filter(
      p => crudActions.includes(p.action) && p.resource !== 'role-management'
    );
    
    return filtered.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = {};
      }
      acc[permission.resource][permission.action] = permission;
      return acc;
    }, {} as Record<string, Record<string, typeof permissions[0]>>);
  }, [permissions]);

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

  // Обработчик переключения permission
  const handlePermissionToggle = useCallback((permissionId: string) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  }, []);

  // Обработчик выбора всех permissions для ресурса
  const handleSelectAllForResource = useCallback((resource: string) => {
    const resourcePermissions = groupedPermissions[resource] || {};
    const resourcePermissionIds = Object.values(resourcePermissions)
      .map(p => p.id)
      .filter(Boolean);
    
    setSelectedPermissionIds(prev => {
      const allSelected = resourcePermissionIds.every(id => prev.includes(id));
      return allSelected
        ? prev.filter(id => !resourcePermissionIds.includes(id))
        : [...new Set([...prev, ...resourcePermissionIds])];
    });
  }, [groupedPermissions]);


  // Сбрасываем состояние после завершения анимации закрытия (300ms - длительность анимации)
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setSelectedPermissionIds([]);
        setError(null);
        setIsLoadingRole(false);
      }, 300); // Задержка равна длительности анимации закрытия
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Обработчик сохранения
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Используем unwrap() для получения результата или ошибки
      await assignPermissions(roleId, {
        permissionIds: selectedPermissionIds,
      }).unwrap();
      
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err || 'Failed to update permissions');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>Update Permissions: {roleName}</DialogTitle>
            <DialogDescription>
              Select permissions for this role. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden px-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 mb-3">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            <Label>Permissions</Label>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {sortedResources.map(([resource, resourcePermissionsMap]) => {
                  const crudActions = ['create', 'read', 'update', 'delete'] as const;
                  
                  // Проверяем, все ли permissions для ресурса выбраны
                  const resourcePermissionIds = Object.values(resourcePermissionsMap)
                    .map(p => p.id)
                    .filter(Boolean);
                  const allSelected = resourcePermissionIds.length > 0 && 
                    resourcePermissionIds.every(id => selectedPermissionIds.includes(id));

                  return (
                    <div key={resource} className="border rounded-lg p-3 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold capitalize">
                          {resource}
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectAllForResource(resource)}
                          className="h-7 text-xs"
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      <div className="flex flex-wrap justify-between gap-y-2">
                        {crudActions.map((action) => {
                          const permission = resourcePermissionsMap[action];
                          if (!permission) return null;
                          
                          return (
                            <div key={permission.id} className="flex items-center space-x-1.5">
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={selectedPermissionIds.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                              />
                              <Label
                                htmlFor={`permission-${permission.id}`}
                                className="text-xs font-normal capitalize cursor-pointer"
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

          <div className="flex justify-end gap-2 pt-4 pb-6 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={rolesLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={rolesLoading || permissionsLoading || isLoadingRole}
            >
              {rolesLoading ? 'Saving...' : isLoadingRole ? 'Loading...' : 'Update Permissions'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

UpdateRolePermissions.displayName = 'UpdateRolePermissions';

