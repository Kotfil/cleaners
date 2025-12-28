'use client';

import React, { memo, useMemo } from 'react';
import { TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { ClientsTableHeaderProps } from './clients-table-header.types';

export const ClientsTableHeader: React.FC<ClientsTableHeaderProps> = memo(({ columns, columnVisibility }) => {
  const visibleColumns = useMemo(() => {
    return columns.filter((column) => {
      const columnId = column.id || (column as any).accessorKey;
      return columnVisibility[columnId] !== false;
    });
  }, [columns, columnVisibility]);
  
  return (
    <TableHeader>
      <TableRow>
        {visibleColumns.map((column, index) => {
          const columnId = column.id || (column as any).accessorKey || `column-${index}`;
          const header = typeof column.header === 'string' ? column.header : (column.header as any)?.toString() || `Column ${index + 1}`;
          
          return (
            <TableHead key={columnId}>
              {header}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}, (prevProps, nextProps) => {
  // Сравниваем columnVisibility для предотвращения лишних перерисовок
  const prevVisibility = JSON.stringify(prevProps.columnVisibility);
  const nextVisibility = JSON.stringify(nextProps.columnVisibility);
  return prevVisibility === nextVisibility;
});

ClientsTableHeader.displayName = 'ClientsTableHeader';
