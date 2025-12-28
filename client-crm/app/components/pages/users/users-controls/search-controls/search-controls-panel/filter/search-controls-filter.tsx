'use client';

import React, { useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { IconChevronDown, IconLayoutColumns } from '@tabler/icons-react';
import { SearchControlsFilterProps } from '../../search-controls.types';
import { USER_STATUS_FILTER_OPTIONS } from './search-controls-filter.list';

export const SearchControlsFilter: React.FC<SearchControlsFilterProps> = ({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  selectedStatus = null,
  onStatusChange,
}) => {
  const handleStatusChange = useCallback(
    (status: 'active' | 'suspended' | 'archived' | null) => {
      if (onStatusChange) {
        onStatusChange(status);
      }
    },
    [onStatusChange],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default">
          <IconLayoutColumns className="mr-2 h-4 w-4" />
          Columns
          <IconChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        {onStatusChange && (
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {USER_STATUS_FILTER_OPTIONS.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value ?? 'all'}
                      checked={selectedStatus === option.value}
                      onCheckedChange={(checked) => checked && handleStatusChange(option.value)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.status !== false}
                    onCheckedChange={(value) => onColumnVisibilityChange('status', !!value)}
                  >
                    Status filter
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        )}
        {onStatusChange && <DropdownMenuSeparator />}
        <DropdownMenuGroup>
          {columns
            .filter((column) => {
              const columnId = column.id || (column as any).accessorKey;
              return columnId !== 'actions' && columnId !== 'status';
            })
            .map((column, index) => {
              const columnId = column.id || (column as any).accessorKey || `column-${index}`;
              const header =
                typeof column.header === 'string'
                  ? column.header
                  : (column.header as any)?.toString() || `Column ${index + 1}`;

              return (
                <DropdownMenuCheckboxItem
                  key={columnId}
                  className="capitalize"
                  checked={columnVisibility[columnId] !== false}
                  onCheckedChange={(value) => onColumnVisibilityChange(columnId, !!value)}
                >
                  {header}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

SearchControlsFilter.displayName = 'SearchControlsFilter';

