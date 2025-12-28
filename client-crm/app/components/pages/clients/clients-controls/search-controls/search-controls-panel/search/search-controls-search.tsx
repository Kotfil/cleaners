'use client';

import React from 'react';
import { Input } from '@/app/components/ui/input';
import { Spinner } from '@/app/components/ui/spinner';
import { SearchControlsSearchProps } from '../../search-controls.types';
import { CLIENTS_SEARCH_MAX_LENGTH } from '../../../../clients.constants';

export const SearchControlsSearch: React.FC<SearchControlsSearchProps> = ({
  searchQuery,
  onSearchChange,
  isSearching = false,
}) => {
  return (
    <div className="relative flex flex-col w-full min-[450px]:w-auto">
      <div className="relative w-full min-[450px]:w-72">
        <Input
          id="search-clients"
          placeholder="Search by Name Email Address Phone"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          maxLength={CLIENTS_SEARCH_MAX_LENGTH}
          className="w-full pr-8"
        />
        {isSearching && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

SearchControlsSearch.displayName = 'SearchControlsSearch';

