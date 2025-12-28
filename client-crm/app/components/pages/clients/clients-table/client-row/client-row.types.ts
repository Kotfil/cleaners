import { ColumnDef } from '@tanstack/react-table';
import { Client } from '@/lib/store/slices/clients-slice/clients-slice.types';

export interface ClientRowProps {
  client: Client;
  visibleColumns: ColumnDef<Client>[];
}
