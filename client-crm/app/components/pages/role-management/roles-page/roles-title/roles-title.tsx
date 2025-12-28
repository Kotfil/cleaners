'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { TypographyH1, TypographyMuted } from '@/app/components/ui/typography';
import { Plus } from 'lucide-react';
import { usePermissions } from '@/lib/store/hooks/permissions.hooks';
import type { RolesTitleProps } from './roles-title.types';
import { RolesCreateDialog } from './roles-create-dialog';


export const RolesTitle: React.FC<RolesTitleProps> = ({ onSuccess }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('role-management:create');

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <TypographyH1 className="text-2xl font-bold">Role Management</TypographyH1>
       
        </div>
        {canCreate && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        )}
      </div>

      {/* Role Create Dialog */}
      <RolesCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onSuccess}
      />
    </>
  );
};

