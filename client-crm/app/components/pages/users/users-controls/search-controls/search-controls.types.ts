import { ColumnDef } from '@tanstack/react-table';

export interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
  columns: ColumnDef<any>[];
  columnVisibility: { [key: string]: boolean };
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
  selectedStatus?: 'active' | 'suspended' | 'archived' | null;
  onStatusChange?: (status: 'active' | 'suspended' | 'archived' | null) => void;
}

export interface SearchControlsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
}

export interface SearchControlsFilterProps {
  columns: ColumnDef<any>[];
  columnVisibility: { [key: string]: boolean };
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
  selectedStatus?: 'active' | 'suspended' | 'archived' | null;
  onStatusChange?: (status: 'active' | 'suspended' | 'archived' | null) => void;
}
