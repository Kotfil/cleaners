'use client';

import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Skeleton } from '@/app/components/ui/skeleton';
import { ClientsTableSkeletonProps } from './clients-table-skeleton.types';
import { TABLE_HEADERS } from './clients-table-skeleton.list';

// Компонент для одной строки skeleton
const ClientTableSkeletonRow: React.FC = memo(() => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
    </TableRow>
  );
});

ClientTableSkeletonRow.displayName = 'ClientTableSkeletonRow';

export const ClientsTableSkeleton: React.FC<ClientsTableSkeletonProps> = memo(({ 
  rowsCount = 5 
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {TABLE_HEADERS.map((header, index) => (
            <TableHead key={`header-${index}`}>
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rowsCount }, (_, index) => (
          <ClientTableSkeletonRow key={`skeleton-${index}`} />
        ))}
      </TableBody>
    </Table>
  );
});

ClientsTableSkeleton.displayName = 'ClientsTableSkeleton';
