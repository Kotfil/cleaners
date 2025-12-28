import React, { memo } from 'react';
import { TableBody, TableRow, TableCell } from '@/app/components/ui/table';
import { UsersTableBodyProps } from './users-table-body.types';

export const UsersTableBody: React.FC<UsersTableBodyProps> = memo(({ users, columns, columnVisibility, onRowClick }) => {
  if (!users || users.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No users found.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {users.map((user) => (
        <TableRow 
          key={user.id}
          onClick={() => onRowClick?.(user)}
          className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
        >
          {columns.map((column, index) => {
            const columnId = column.id || (column as any).accessorKey || `column-${index}`;
            
            // Колонка actions (иконки) всегда видима
            if (columnId !== 'actions' && columnVisibility[columnId] === false) {
              return null;
            }

            return (
              <TableCell key={columnId}>
                {column.cell ? 
                  (column.cell as any)({ row: { original: user } }) : 
                  (user as any)[(column as any).accessorKey]
                }
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
});

UsersTableBody.displayName = 'UsersTableBody';
