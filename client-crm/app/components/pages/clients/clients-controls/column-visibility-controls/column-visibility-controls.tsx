'use client';

import React, { memo, useCallback } from 'react';
import { useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import { IconChevronDown, IconLayoutColumns } from '@tabler/icons-react';
import { ColumnVisibilityControlsProps } from './column-visibility-controls.types';

export const ColumnVisibilityControls: React.FC<ColumnVisibilityControlsProps> = memo(({
  columns,
  onColumnToggle
}) => {
  const [isPending, startTransition] = useTransition();

  const handleColumnToggle = useCallback((columnId: string, visible: boolean) => {
    startTransition(() => {
      onColumnToggle(columnId, visible);
    });
  }, [onColumnToggle]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" disabled={isPending}>
          <IconLayoutColumns className="mr-2 h-4 w-4" />
          Columns
          <IconChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns
          .filter((column) => column.getCanHide())
          .map((column, index) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id || `column-${index}`}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) =>
                  handleColumnToggle(column.id, !!value)
                }
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ColumnVisibilityControls.displayName = 'ColumnVisibilityControls';
