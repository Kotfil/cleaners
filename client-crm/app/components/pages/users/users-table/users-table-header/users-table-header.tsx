import React, { memo } from 'react';
import { TableHeader, TableRow, TableHead } from '@/app/components/ui/table';
import { UsersTableHeaderProps } from './users-table-header.types';

export const UsersTableHeader: React.FC<UsersTableHeaderProps> = memo(({ columns, columnVisibility }) => {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column, index) => {
          const columnId = column.id || (column as any).accessorKey || `column-${index}`;
          const header = typeof column.header === 'string' ? column.header : (column.header as any)?.toString() || `Column ${index + 1}`;
          
          // Колонка actions (иконки) всегда видима
          if (columnId !== 'actions' && columnVisibility[columnId] === false) {
            return null;
          }

          return (
            <TableHead key={columnId} className="text-left">
              {header}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
});

UsersTableHeader.displayName = 'UsersTableHeader';
