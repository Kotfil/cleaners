'use client';

import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet';
import { Textarea } from '@/app/components/ui/textarea';
import { usePermissionsData } from '@/lib/store/hooks/permissions-data.hooks';
import { useRoles } from '@/lib/store/hooks/roles.hooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RolesCreateDialogProps, RoleFormData } from './roles-create-dialog.types';


export const RolesCreateDialog: React.FC<RolesCreateDialogProps> = React.memo(({
  open,
  onOpenChange,
  roleId,
  roleName,
  roleDescription,
  rolePermissions = [],
  onSuccess,
}) => {
  const { createRole, updateRole, assignPermissions, loading: rolesLoading } = useRoles();
  const { permissions, fetchPermissions, loading: permissionsLoading } = usePermissionsData();
  const [formData, setFormData] = useState<RoleFormData>({
    name: roleName || '',
    description: roleDescription || '',
    permissionIds: rolePermissions,
  });

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (open && permissions.length === 0) {
      fetchPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  useEffect(() => {
    if (open) {
      setFormData({
        name: roleName || '',
        description: roleDescription || '',
        permissionIds: rolePermissions,
      });
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Только при открытии диалога

  // Группируем permissions по ресурсам (мемоизируем для предотвращения бесконечных ререндеров)
  // Исключаем role-management полностью - эти permissions только для Owner и не назначаются ролям
  const groupedPermissions = useMemo(() => {
    return permissions
      .filter(p => p.resource !== 'role-management')
      .reduce((acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      }, {} as Record<string, typeof permissions>);
  }, [permissions]);

  // Функция для отображения action
  const getActionLabel = (action: string): string => {
    if (action === 'read') return 'view';
    if (action === 'update') return 'edit';
    if (action === 'create') return 'create';
    if (action === 'delete') return 'delete';
    return action;
  };

  // Мемоизируем обработчики для предотвращения ненужных ререндеров
  const handlePermissionToggle = useCallback((permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  }, []);

  const handleSelectAllForResource = useCallback((resource: string) => {
    const resourcePermissions = groupedPermissions[resource] || [];
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    
    setFormData(prev => {
      const allSelected = resourcePermissionIds.every(id => prev.permissionIds.includes(id));
      return {
        ...prev,
        permissionIds: allSelected
          ? prev.permissionIds.filter(id => !resourcePermissionIds.includes(id))
          : [...new Set([...prev.permissionIds, ...resourcePermissionIds])],
      };
    });
  }, [groupedPermissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      if (roleId) {
        // Режим редактирования
        await updateRole(roleId, {
          name: formData.name,
          description: formData.description,
        });
        // Обновляем permissions
        await assignPermissions(roleId, {
          permissionIds: formData.permissionIds,
        });
      } else {
        // Режим создания
        const result = await createRole({
          name: formData.name,
          description: formData.description,
        });

        // Назначаем permissions новой роли
        if (result.payload && typeof result.payload === 'object' && 'id' in result.payload) {
          await assignPermissions((result.payload as any).id, {
            permissionIds: formData.permissionIds,
          });
        }
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save role');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl lg:max-w-4xl overflow-hidden flex flex-col p-0">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>{roleId ? 'Edit Role' : 'Create New Role'}</SheetTitle>
          <SheetDescription>
            {roleId
              ? 'Update role details and permissions'
              : 'Create a new role and assign permissions'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden px-6 pb-6">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Role Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Role Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Manager, Accountant"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* Role Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the role"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Permissions */}
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  {permissionsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading permissions...</p>
                  ) : (
                    Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
                      const allSelected = resourcePermissions.every(p =>
                        formData.permissionIds.includes(p.id)
                      );

                      return (
                        <div key={resource} className="space-y-2">
                          {/* Resource Header */}
                          <div className="flex items-center justify-between border-b pb-2">
                            <Label className="text-base font-semibold capitalize">
                              {resource}
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectAllForResource(resource)}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </Button>
                          </div>

                          {/* Permissions List */}
                          <div className="flex flex-wrap gap-4 pl-4">
                            {resourcePermissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2 min-w-[120px]">
                                <Checkbox
                                  id={permission.id}
                                  checked={formData.permissionIds.includes(permission.id)}
                                  onCheckedChange={() => handlePermissionToggle(permission.id)}
                                />
                                <Label
                                  htmlFor={permission.id}
                                  className="text-lg font-normal cursor-pointer"
                                >
                                  {getActionLabel(permission.action)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected {formData.permissionIds.length} of {permissions.length} permissions
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={rolesLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={rolesLoading || permissionsLoading}>
              {rolesLoading ? 'Saving...' : roleId ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
});

RolesCreateDialog.displayName = 'RolesCreateDialog';

