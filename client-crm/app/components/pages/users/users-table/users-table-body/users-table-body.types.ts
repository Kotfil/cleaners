import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/store/slices/users-slice/users-slice.types';

export interface UsersTableBodyProps {
  users: User[];
  columns: ColumnDef<any>[];
  columnVisibility: { [key: string]: boolean };
  onRowClick?: (user: User) => void;
}
