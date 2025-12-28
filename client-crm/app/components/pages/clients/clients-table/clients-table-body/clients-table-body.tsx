'use client';

import React, { memo, useMemo } from 'react';
import { TableBody, TableCell, TableRow } from '@/app/components/ui/table';
import { ClientRow } from '../client-row';
import { ClientsTableBodyProps } from './clients-table-body.types';

export const ClientsTableBody: React.FC<ClientsTableBodyProps> = memo(({ clients, columns, columnVisibility }) => {
  const visibleColumns = useMemo(() => {
    return columns.filter((column) => {
      const columnId = column.id || (column as any).accessorKey;
      return columnVisibility[columnId] !== false;
    });
  }, [columns, columnVisibility]);
  console.log('clients', clients);
  if (clients.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={visibleColumns.length}
            className="h-24 text-center"
          >
            No clients found.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {clients.map((client, index) => (
        <ClientRow key={client.id || `client-${index}`} client={client} visibleColumns={visibleColumns} />
      ))}
    </TableBody>
  );
});

ClientsTableBody.displayName = 'ClientsTableBody';
