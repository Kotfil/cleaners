import { ColumnDef } from '@tanstack/react-table';

export interface UsersTableHeaderProps {
  columns: ColumnDef<any>[];
  columnVisibility: { [key: string]: boolean };
}
