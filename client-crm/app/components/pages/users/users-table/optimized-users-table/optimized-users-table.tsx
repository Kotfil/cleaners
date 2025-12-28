'use client';

import { UsersTableSkeleton } from '@/app/components/pages/users/users-controls/users-table-skeleton';
import { SearchControls } from '@/app/components/pages/users/users-controls/search-controls';
import { TablePagination } from '@/app/components/pages/users/users-controls/table-pagination';
import { Table } from '@/app/components/ui/table';
import { AppDispatch, RootState } from '@/lib/store';
import { fetchUsers, searchUsers } from '@/lib/store/slices/users-slice/users-slice';
import React, { memo, useCallback, useMemo, useState, useTransition } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { UsersTableBody } from '../users-table-body';
import { UsersTableHeader } from '../users-table-header';
import { UsersTableProps } from '../users-table.types';
import { createColumns } from './optimized-users-table.helper';
import { UserDrawer } from '../../users-table-columns/user-drawer';
import { User } from '@/lib/store/slices/users-slice/users-slice.types';
import { USERS_PAGE_LIMIT } from '../../users.constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

const OptimizedUsersTableComponent: React.FC<UsersTableProps> = ({ loading }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isPending, startTransition] = useTransition();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const defaultColumnVisibility = {
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        actions: true, // Колонка actions всегда видима (иконки)
    };
    const [columnVisibility, setColumnVisibility] = useLocalStorage<{ [key: string]: boolean }>(
        'users-table-column-visibility',
        defaultColumnVisibility
    );
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedStatus, setSelectedStatus] = useLocalStorage<'active' | 'suspended' | 'archived' | null>(
        'users-table-status-filter',
        null
    );
    console.log('[USERS] selectedStatus:', selectedStatus);
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const statusRef = React.useRef(selectedStatus);
    const dispatchRef = React.useRef(dispatch);
    const startTransitionRef = React.useRef(startTransition);
    console.log('[USERS] statusRef.current:', statusRef.current);
    React.useEffect(() => {
        statusRef.current = selectedStatus;
        dispatchRef.current = dispatch;
        startTransitionRef.current = startTransition;
    }, [selectedStatus, dispatch, startTransition]);

    // Загружаем пользователей при монтировании (используем refs для стабильности)
    React.useEffect(() => {
        const currentQuery = searchQueryRef.current.trim();
        if (!currentQuery) {
            startTransitionRef.current(() => {
                dispatchRef.current(fetchUsers({ page: 1, limit: USERS_PAGE_LIMIT, status: statusRef.current }));
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Отдельный эффект для реакции на изменение статуса (только если изменился статус, а не другие зависимости)
    const prevStatusRef = React.useRef(selectedStatus);
    React.useEffect(() => {
        if (prevStatusRef.current !== selectedStatus) {
            prevStatusRef.current = selectedStatus;
            const currentQuery = searchQueryRef.current.trim();
            if (!currentQuery) {
                startTransitionRef.current(() => {
                    dispatchRef.current(fetchUsers({ page: 1, limit: USERS_PAGE_LIMIT, status: selectedStatus }));
                });
            }
        }
    }, [selectedStatus]);

    // Очистка таймаута при размонтировании
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleOpenDrawer = useCallback((user: User) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
    }, []);

    const handleDrawerClose = useCallback((open: boolean, currentPage?: number) => {
        setIsDrawerOpen(open);
        if (!open) {
            setSelectedUser(null);
            const targetPage = currentPage || 1;
            const currentQuery = searchQueryRef.current.trim();
            const currentStatus = statusRef.current;
            startTransition(() => {
                if (currentQuery) {
                    dispatch(searchUsers({ query: currentQuery, page: targetPage, limit: USERS_PAGE_LIMIT }));
                } else {
                    dispatch(fetchUsers({ page: targetPage, limit: USERS_PAGE_LIMIT, status: currentStatus }));
                }
            });
        }
    }, [dispatch, startTransition]);

    // Мемоизированные колонки
    const columns = useMemo(() => createColumns(handleOpenDrawer), [handleOpenDrawer]);
    
    const debouncedSearch = useCallback((query: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            if (query.trim()) {
                startTransition(() => {
                    dispatch(searchUsers({ query: query.trim(), page: 1, limit: USERS_PAGE_LIMIT }));
                });
            } else {
                startTransition(() => {
                    dispatch(fetchUsers({ page: 1, limit: USERS_PAGE_LIMIT, status: selectedStatus }));
                });
            }
        }, 300);
    }, [dispatch, startTransition, selectedStatus]);

    // Handle search input change
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        debouncedSearch(query);
    }, [debouncedSearch]);

    // Handle column visibility change
    const handleColumnVisibilityChange = useCallback((columnId: string, isVisible: boolean) => {
        // Колонка actions (иконки) всегда видима, нельзя скрыть
        if (columnId === 'actions') {
            return;
        }
        setColumnVisibility(prev => ({
            ...prev,
            [columnId]: isVisible
        }));
    }, [setColumnVisibility]);

    const { users, pagination, loading: reduxLoading } = useSelector(
        (state: RootState) => ({
            users: state.users.users,
            pagination: state.users.pagination,
            loading: state.users.loading,
        }),
        shallowEqual
    );

    const isLoading = useMemo(() => reduxLoading || loading || isPending, [reduxLoading, loading, isPending]);

    const paginationPage = pagination?.page ?? 1;
    const paginationTotalPages = pagination?.totalPages ?? 1;
    const totalItems = pagination?.total ?? 0;
    const canPreviousPage = paginationPage > 1;
    const canNextPage = paginationPage < paginationTotalPages;

    const searchQueryRef = React.useRef(searchQuery);
    React.useEffect(() => {
        searchQueryRef.current = searchQuery;
    }, [searchQuery]);

    const handlePageChange = useCallback((page: number) => {
        const trimmedQuery = searchQueryRef.current.trim();
        startTransition(() => {
            if (trimmedQuery) {
                dispatch(searchUsers({ query: trimmedQuery, page, limit: USERS_PAGE_LIMIT }));
            } else {
                dispatch(fetchUsers({ page, limit: USERS_PAGE_LIMIT, status: selectedStatus }));
            }
        });
    }, [dispatch, startTransition, selectedStatus]);

    const memoizedColumnVisibility = useMemo(() => columnVisibility, [
        columnVisibility.name,
        columnVisibility.email,
        columnVisibility.phone,
        columnVisibility.address,
        columnVisibility.role,
        columnVisibility.status,
        columnVisibility.createdAt,
        columnVisibility.actions,
    ]);
    console.log('[USERS] users length:', users?.length, 'data:', users);
    return (
        <div className="w-full">
            <SearchControls
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                isSearching={isLoading && !!searchQuery}
                columns={columns}
                columnVisibility={memoizedColumnVisibility}
                onColumnVisibilityChange={handleColumnVisibilityChange}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
            />

            <div className="rounded-md border">
                {isLoading && !users?.length ? (
                    <UsersTableSkeleton rowsCount={5}/>
                ) : (
                    <Table>
                        <UsersTableHeader columns={columns} columnVisibility={memoizedColumnVisibility}/>
                        <UsersTableBody users={users} columns={columns} columnVisibility={memoizedColumnVisibility}/>
                    </Table>
                )}
            </div>

            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                    Total: {totalItems} user(s)
                </div>
                <TablePagination
                    currentPage={paginationPage}
                    totalPages={paginationTotalPages}
                    onPageChange={handlePageChange}
                    canPreviousPage={canPreviousPage}
                    canNextPage={canNextPage}
                />
            </div>

            {selectedUser && (
                <UserDrawer
                    user={selectedUser}
                    isOpen={isDrawerOpen}
                    onClose={(open) => handleDrawerClose(open, paginationPage)}
                />
            )}
        </div>
    );
};

export const OptimizedUsersTable = memo(OptimizedUsersTableComponent);

OptimizedUsersTable.displayName = 'OptimizedUsersTable';
