import { ColumnDef } from '@tanstack/react-table';
import { Client } from '@/lib/store/slices/clients-slice/clients-slice.types';

export interface ColumnVisibility {
  [key: string]: boolean;
}

export interface ClientsTableHeaderProps {
  columns: ColumnDef<Client>[];
  columnVisibility: ColumnVisibility;
}
