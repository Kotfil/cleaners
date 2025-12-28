import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/lib/store/slices/users-slice/users-slice.types';
import { UserNameCell } from '../../users-table-columns/user-name-cell';
import { UserEmailCell } from '../../users-table-columns/user-email-cell';
import { UserRoleCell } from '../../users-table-columns/user-role-cell';
import { UserPhoneCell } from '../../users-table-columns/user-phone-cell';
import { UserAddressCell } from '../../users-table-columns/user-address-cell';
import { UserStatusBadge } from '../../users-table-columns/user-status-badge';
import { UserCreatedAtCell } from '../../users-table-columns/user-created-at-cell';
import { UserActionsCell } from '../../users-table-columns/user-actions-cell';

export const createColumns = (onOpenDrawer: (user: User) => void): ColumnDef<User>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <UserNameCell user={row.original} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <UserEmailCell user={row.original} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => <UserPhoneCell user={row.original} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => <UserAddressCell user={row.original} />,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <UserRoleCell user={row.original} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <UserStatusBadge user={row.original} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => <UserCreatedAtCell user={row.original} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <UserActionsCell user={row.original} onOpenDrawer={() => onOpenDrawer(row.original)} />,
    enableSorting: false,
    enableHiding: false,
  },
];
