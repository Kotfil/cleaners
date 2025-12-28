import { ColumnCellProps, CreateColumnsFunction } from './optimized-clients-table.types';

export const createColumns: CreateColumnsFunction = () => [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({row}: ColumnCellProps) => {
            return row.original.name;
        },
    },
    {
        accessorKey: 'phones',
        header: 'Primary Phone',
        cell: ({row}: ColumnCellProps) => {
            const phones = row.original.phones;
            if (!phones || phones.length === 0) {
                return '-';
            }
            const primaryPhone = phones.find(p => p.isPrimary) || phones[0];
            return primaryPhone.number;
        },
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({row}: ColumnCellProps) => {
            const email = row.getValue('email') as string;
            return email;
        },
    },
    {
        accessorKey: 'formattedAddress',
        header: 'Address',
        cell: ({row}: ColumnCellProps) => {
            const address = row.original.formattedAddress;
            const city = row.original.city;
            const state = row.original.state;

            if (!address && !city && !state) {
                return '-';
            }

            return `${address || ''} ${city || ''} ${state || ''}`.trim();
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({row}: ColumnCellProps) => {
            const date = row.original.createdAt;
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row}: ColumnCellProps) => {
            const status = row.original.status;
            return status === 'active' ? 'Active' : status === 'suspended' ? 'Suspended' : 'Archived';
        },
    },
];
