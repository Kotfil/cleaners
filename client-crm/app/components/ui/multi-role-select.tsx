'use client';

import React, { memo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from './select';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { cn } from '@/helpers/utils';
import { Badge } from './badge';

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface MultiRoleSelectProps {
  roles: Role[];
  selectedRoles: string[]; // Array of role names
  onRolesChange: (roles: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export const MultiRoleSelect: React.FC<MultiRoleSelectProps> = memo(({
  roles,
  selectedRoles,
  onRolesChange,
  disabled = false,
  placeholder = 'Select roles',
  error = false,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const toggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      // Не позволяем удалить последнюю роль
      if (selectedRoles.length === 1) {
        return;
      }
      onRolesChange(selectedRoles.filter(r => r !== roleName));
    } else {
      onRolesChange([...selectedRoles, roleName]);
    }
  };

  const removeRole = (roleName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRoles.length === 1) {
      return; // Не позволяем удалить последнюю роль
    }
    onRolesChange(selectedRoles.filter(r => r !== roleName));
  };

  const selectedRolesData = roles.filter(r => selectedRoles.includes(r.name));
  const maxVisibleRoles = 3;
  const visibleRoles = selectedRolesData.slice(0, maxVisibleRoles);
  const hiddenRolesCount = selectedRolesData.length - maxVisibleRoles;
  const shouldShowEllipsis = selectedRolesData.length > maxVisibleRoles;

  return (
    <Select open={open} onOpenChange={setOpen} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'w-full min-h-9 h-auto py-1 overflow-hidden',
          error && 'border-destructive',
          className
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0 items-center overflow-hidden pr-2">
          {selectedRoles.length === 0 ? (
            <SelectValue placeholder={placeholder} />
          ) : (
            <>
              {visibleRoles.map((role) => (
                <Badge
                  key={role.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 shrink-0"
                  onClick={(e) => removeRole(role.name, e)}
                >
                  {role.name}
                </Badge>
              ))}
              {shouldShowEllipsis && (
                <Badge
                  variant="secondary"
                  className="shrink-0"
                >
                  +{hiddenRolesCount}
                </Badge>
              )}
            </>
          )}
        </div>
      </SelectTrigger>
      <SelectContent 
        className="w-[var(--radix-select-trigger-width)]" 
        position="popper"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <SelectPrimitive.Viewport className="p-2 max-h-[300px] overflow-y-auto">
          {roles.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No roles available
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => {
                const isSelected = selectedRoles.includes(role.name);
                return (
                  <div
                    key={role.id}
                    className={cn(
                      'flex items-center space-x-2 rounded-md p-2 hover:bg-accent cursor-pointer',
                      isSelected && 'bg-accent'
                    )}
                    onClick={() => toggleRole(role.name)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isSelected && selectedRoles.length === 1}
                      onCheckedChange={() => toggleRole(role.name)}
                    />
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <div className="font-medium">{role.name}</div>
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </SelectPrimitive.Viewport>
        {selectedRoles.length > 0 && (
          <div className="border-t p-2 text-xs text-muted-foreground">
            {selectedRoles.length} role{selectedRoles.length > 1 ? 's' : ''} selected
          </div>
        )}
      </SelectContent>
    </Select>
  );
});

MultiRoleSelect.displayName = 'MultiRoleSelect';

