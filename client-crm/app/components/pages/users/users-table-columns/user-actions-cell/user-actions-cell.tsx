'use client';

import React, { memo, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { IconArchive, IconEdit } from '@tabler/icons-react';
import { AppDispatch } from '@/lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { archiveUser, fetchUsers } from '@/lib/store/slices/users-slice/users-slice';
import { toast } from 'sonner';
import { UserActionsCellProps } from './user-actions-cell.types';
import { USERS_PAGE_LIMIT } from '../../users.constants';

export const UserActionsCell: React.FC<UserActionsCellProps> = memo(({ user, onOpenDrawer }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const pagination = useSelector((state: RootState) => state.users.pagination);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  // Check if current user is trying to archive themselves
  const isCurrentUser = currentUser?.sub === user.id || currentUser?.id === user.id;

  const handleEdit = () => {
    if (onOpenDrawer) {
      onOpenDrawer();
    }
  };

  const handleArchive = async () => {
    try {
      await dispatch(archiveUser(user.id)).unwrap();
      toast.success('User archived successfully');
      setIsArchiveDialogOpen(false);
      
      // Обновляем список пользователей с текущей страницы
      const currentPage = pagination?.page || 1;
      const statusFilter = localStorage.getItem('users-table-status-filter');
      const parsedStatus = statusFilter ? JSON.parse(statusFilter) : null;
      
      dispatch(fetchUsers({ 
        page: currentPage, 
        limit: USERS_PAGE_LIMIT, 
        status: parsedStatus 
      }));
    } catch (error: any) {
      toast.error(error || 'Failed to archive user');
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit();
          }}
        >
          <IconEdit className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Edit user</span>
        </Button>
        {/* {!isCurrentUser && user.status !== 'archived' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-amber-500/10 hover:text-amber-600"
            onClick={(e) => {
              e.stopPropagation();
              setIsArchiveDialogOpen(true);
            }}
          >
            <IconArchive className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Archive user</span>
          </Button>
        )} */}
      </div>
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive User</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 pt-2">
                <div className="font-medium text-amber-600">
                  ⚠️ Warning: This will archive the user &quot;{user.name || user.email}&quot;
                </div>
                <div className="text-sm">
                  Archived users will not be able to sign in and will be hidden from active lists.
                  You can restore them later by changing their status back to Active.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleArchive}
            >
              Archive User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

UserActionsCell.displayName = 'UserActionsCell';

