'use client';

import React, { memo, useCallback, useTransition } from 'react';
import { AddClientDialog } from '../add-client-dialog';
import { SearchControlsFilter } from './search-controls-panel/filter';
import { SearchControlsSearch } from './search-controls-panel/search';
import { SearchControlsProps } from './search-controls.types';

export const SearchControls: React.FC<SearchControlsProps> = memo(({
  searchQuery,
  onSearchChange,
  isSearching = false,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  selectedStatus = null,
  onStatusChange,
}) => {
  const [, startTransition] = useTransition();

  const handleColumnVisibilityChange = useCallback((columnId: string, isVisible: boolean) => {
    onColumnVisibilityChange(columnId, isVisible);
  }, [onColumnVisibilityChange]);

  return (
    <div className="flex flex-col py-4 gap-3 min-[1100px]:flex-row min-[1100px]:items-end min-[1100px]:justify-between min-[1100px]:gap-0">
      <div className="flex flex-col min-[450px]:flex-row min-[450px]:items-end items-start space-y-2 min-[450px]:space-y-0 min-[450px]:space-x-2 w-full min-[1100px]:w-auto">
        <SearchControlsSearch
          searchQuery={searchQuery}
          onSearchChange={(query) => startTransition(() => onSearchChange(query))}
          isSearching={isSearching}
        />
        <SearchControlsFilter
          columns={columns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
        />
      </div>
      {/* Нижний блок: Add client */}
      <div className="flex items-center space-x-2 w-full min-[450px]:w-auto min-[1100px]:justify-end justify-start min-[1100px]:w-auto">
        <AddClientDialog />
      </div>
    </div>
  );
});

SearchControls.displayName = 'SearchControls';
