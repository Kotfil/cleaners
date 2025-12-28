'use client';

import React, { memo, useState } from 'react';
import { TableCell, TableRow } from '@/app/components/ui/table';
import { ClientNameCell } from '@/app/components/pages/clients/clients-table-columns/client-name-cell';
import { ClientPhoneCell } from '@/app/components/pages/clients/clients-table-columns/client-phone-cell';
import { ClientEmailCell } from '@/app/components/pages/clients/clients-table-columns/client-email-cell';
import { ClientAddressCell } from '@/app/components/pages/clients/clients-table-columns/client-address-cell';
import { ClientCreatedAtCell } from '@/app/components/pages/clients/clients-table-columns/client-created-at-cell';
import { ClientStatusBadge } from '@/app/components/pages/clients/clients-table-columns/client-status-badge';
import { ClientActionsCell } from '@/app/components/pages/clients/clients-table-columns/client-actions-cell';
import { ClientDrawer } from '@/app/components/pages/clients/clients-table-columns/client-drawer';
import { ClientRowProps } from './client-row.types';

export const ClientRow: React.FC<ClientRowProps> = memo(({ client, visibleColumns }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const renderCell = (columnId: string) => {
    switch (columnId) {
      case 'name':
        return <ClientNameCell name={client.name} />;
      case 'phone':
        return <ClientPhoneCell phones={client.phones} />;
      case 'email':
        return <ClientEmailCell email={client.email} />;
      case 'address':
        return (
          <ClientAddressCell 
            address={client.formattedAddress}
            city={client.city}
            state={client.state}
          />
        );
      case 'createdAt':
        return <ClientCreatedAtCell createdAt={client.createdAt} />;
      case 'status':
        return (
          <ClientStatusBadge 
            status={client.status} 
            clientId={client.id}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      case 'actions':
        return (
          <ClientActionsCell 
            client={client}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <TableRow 
        data-state={false}
      >
        {visibleColumns.map((column, index) => {
          const columnId = column.id || (column as any).accessorKey || `column-${index}`;
          return (
            <TableCell key={columnId}>
              {renderCell(columnId)}
            </TableCell>
          );
        })}
      </TableRow>
      <ClientDrawer 
        client={client} 
        isOpen={isDrawerOpen} 
        onClose={(open: boolean) => setIsDrawerOpen(open)} 
      />
    </>
  );
});

ClientRow.displayName = 'ClientRow';
