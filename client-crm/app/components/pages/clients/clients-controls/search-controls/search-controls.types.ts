import { ColumnDef } from '@tanstack/react-table';
import { Client } from '@/lib/store/slices/clients-slice/clients-slice.types';
import { ColumnVisibility } from '../../clients-table/clients-table-header/clients-table-header.types';

export interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
  columns: ColumnDef<Client>[];
  columnVisibility: ColumnVisibility;
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
  columns: ColumnDef<Client>[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
  selectedStatus?: 'active' | 'suspended' | 'archived' | null;
  onStatusChange?: (status: 'active' | 'suspended' | 'archived' | null) => void;
}

