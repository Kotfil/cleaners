import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Client } from '@/lib/store/slices/clients-slice/clients-slice.types';

export type CreateColumnsFunction = () => ColumnDef<Client>[];
export type ColumnCellProps = CellContext<Client, unknown>;
