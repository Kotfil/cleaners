import { ColumnDef } from '@tanstack/react-table';
import { Client } from '@/lib/store/slices/clients-slice/clients-slice.types';
import { ColumnVisibility } from '../clients-table-header/clients-table-header.types';

export interface ClientsTableBodyProps {
  clients: Client[];
  columns: ColumnDef<Client>[];
  columnVisibility: ColumnVisibility;
}
