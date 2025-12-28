'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useRoles } from '@/lib/store/hooks/roles.hooks';
import { toast } from 'sonner';
import type { DeleteRoleButtonProps } from './delete-role-button.types';


export const DeleteRoleButton: React.FC<DeleteRoleButtonProps> = ({
  roleId,
  roleName,
  onSuccess,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { deleteRole, loading } = useRoles();

  // Обработчик удаления роли
  const handleDelete = useCallback(async () => {
    try {
      await deleteRole(roleId).unwrap();
      toast.success(`Role "${roleName}" deleted successfully`);
      setIsDialogOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error || `Failed to delete role "${roleName}"`);
    }
  }, [roleId, roleName, deleteRole, onSuccess]);

  return (
    <>
      <Button
        variant="outline"
        size="icon-lg"
        onClick={() => setIsDialogOpen(true)}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        title="Delete Role"
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role &quot;{roleName}&quot;? 
              This action cannot be undone. Users with this role will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

