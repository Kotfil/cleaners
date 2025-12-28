import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Skeleton } from '@/app/components/ui/skeleton';
import { UsersTableSkeletonProps } from './users-table-skeleton.types';
import { getSkeletonRows } from './users-table-skeleton.list';

export const UsersTableSkeleton: React.FC<UsersTableSkeletonProps> = memo(({ rowsCount = 5 }) => {
  const skeletonRows = getSkeletonRows(rowsCount);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead className="w-[200px]">Email</TableHead>
          <TableHead className="w-[100px]">Role</TableHead>
          <TableHead className="w-[150px]">Phone</TableHead>
          <TableHead className="w-[100px]">Status</TableHead>
          <TableHead className="w-[150px]">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skeletonRows.map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[180px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[80px] rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[60px] rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});

UsersTableSkeleton.displayName = 'UsersTableSkeleton';
