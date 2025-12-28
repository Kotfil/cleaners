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
import { archiveClient, fetchClients } from '@/lib/store/slices/clients-slice/clients-slice';
import { toast } from 'sonner';
import { ClientActionsCellProps } from './client-actions-cell.types';
import { CLIENTS_PAGE_LIMIT } from '../../clients.constants';

export const ClientActionsCell: React.FC<ClientActionsCellProps> = memo(({ client, onOpenDrawer }) => {
  const dispatch = useDispatch<AppDispatch>();
  const pagination = useSelector((state: RootState) => state.clients.pagination);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const handleEdit = () => {
    if (onOpenDrawer) {
      onOpenDrawer();
    }
  };

  const handleArchive = async () => {
    try {
      await dispatch(archiveClient(client.id)).unwrap();
      toast.success('Client archived successfully');
      setIsArchiveDialogOpen(false);
      
      // Обновляем список клиентов с текущей страницы
      const currentPage = pagination?.page || 1;
      const statusFilter = localStorage.getItem('clients-table-status-filter');
      const parsedStatus = statusFilter ? JSON.parse(statusFilter) : null;
      
      dispatch(fetchClients({ 
        page: currentPage, 
        limit: CLIENTS_PAGE_LIMIT, 
        status: parsedStatus 
      }));
    } catch (error: any) {
      toast.error(error || 'Failed to archive client');
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
          <span className="sr-only">Edit client</span>
        </Button>
        {client.status !== 'archived' && (
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
            <span className="sr-only">Archive client</span>
          </Button>
        )}
      </div>
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Client</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 pt-2">
                <div className="font-medium text-amber-600">
                  ⚠️ Warning: This will archive the client &quot;{client.name || client.email}&quot;
                </div>
                <div className="text-sm">
                  Archived clients will not be able to sign in and will be hidden from active lists.
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
              Archive Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

ClientActionsCell.displayName = 'ClientActionsCell';

