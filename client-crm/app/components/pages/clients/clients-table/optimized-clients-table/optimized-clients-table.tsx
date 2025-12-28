'use client';

import { ClientsTableSkeleton } from '@/app/components/pages/clients/clients-controls/clients-table-skeleton';
import { SearchControls } from '@/app/components/pages/clients/clients-controls/search-controls';
import { TablePagination } from '@/app/components/pages/clients/clients-controls/table-pagination';
import { Table } from '@/app/components/ui/table';
import { AppDispatch, RootState } from '@/lib/store';
import { fetchClients, searchClients } from '@/lib/store/slices/clients-slice/clients-slice';
import React, { memo, useCallback, useMemo, useTransition } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { ClientsTableBody } from '../clients-table-body';
import { ClientsTableHeader } from '../clients-table-header';
import { ClientsTableProps } from '../clients-table.types';
import { createColumns } from './optimized-clients-table.helper';
import { AddClientDialog } from '../../clients-controls/add-client-dialog';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { CLIENTS_PAGE_LIMIT } from '../../clients.constants';

const OptimizedClientsTableComponent: React.FC<ClientsTableProps> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [isPending, startTransition] = useTransition();

    const defaultColumnVisibility = {
        name: true,
        phone: true,
        email: true,
        address: true,
        createdAt: true,
        status: true,
        actions: true,
    };
    const [columnVisibility, setColumnVisibility] = useLocalStorage<{[key: string]: boolean}>(
        'clients-table-column-visibility',
        defaultColumnVisibility
    );
    const [selectedStatus, setSelectedStatus] = useLocalStorage<'active' | 'suspended' | 'archived' | null>(
        'clients-table-status-filter',
        null
    );
    const [searchQuery, setSearchQuery] = React.useState('');
    console.log('[CLIENTS] selectedStatus:', selectedStatus);

    // Мемоизированные колонки
    const columns = useMemo(() => createColumns(), []);

    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const statusRef = React.useRef(selectedStatus);
    const dispatchRef = React.useRef(dispatch);
    const startTransitionRef = React.useRef(startTransition);
    console.log('[CLIENTS] statusRef.current:', statusRef.current);
    React.useEffect(() => {
        statusRef.current = selectedStatus;
        dispatchRef.current = dispatch;
        startTransitionRef.current = startTransition;
    }, [selectedStatus, dispatch, startTransition]);

    // Загружаем клиентов при монтировании (используем refs для стабильности)
    React.useEffect(() => {
        const currentQuery = searchQueryRef.current.trim();
        if (!currentQuery) {
            startTransitionRef.current(() => {
                dispatchRef.current(fetchClients({ page: 1, limit: CLIENTS_PAGE_LIMIT, status: statusRef.current }));
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
                    dispatchRef.current(fetchClients({ page: 1, limit: CLIENTS_PAGE_LIMIT, status: selectedStatus }));
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

    const searchQueryRef = React.useRef(searchQuery);
    React.useEffect(() => {
        searchQueryRef.current = searchQuery;
    }, [searchQuery]);

    // Debounced search function
    const debouncedSearch = useCallback((query: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            if (query.trim()) {
                startTransition(() => {
                    dispatch(searchClients({ query: query.trim(), page: 1, limit: CLIENTS_PAGE_LIMIT }));
                });
            } else {
                startTransition(() => {
                    dispatch(fetchClients({ page: 1, limit: CLIENTS_PAGE_LIMIT, status: selectedStatus }));
                });
            }
        }, 300);
    }, [dispatch, selectedStatus]);

    // Handle search input change
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        debouncedSearch(query);
    }, [debouncedSearch]);

    // Handle column visibility change
    const handleColumnVisibilityChange = useCallback((columnId: string, isVisible: boolean) => {
        setColumnVisibility(prev => ({
            ...prev,
            [columnId]: isVisible
        }));
    }, [setColumnVisibility]);

    // Используем shallowEqual для предотвращения лишних перерисовок
    const { clients: tableData, pagination, loading: reduxLoading } = useSelector(
        (state: RootState) => ({
            clients: state.clients.clients,
            pagination: state.clients.pagination,
            loading: state.clients.loading,
        }),
        shallowEqual
    );
    const isLoading = useMemo(() => reduxLoading || isPending, [reduxLoading, isPending]);
    
    // Обработчик изменения страницы - использует refs для полной стабильности функции
    const handlePageChange = React.useCallback((page: number) => {
        const currentQuery = searchQueryRef.current.trim();
        const currentStatus = statusRef.current;
        if (currentQuery) {
            startTransitionRef.current(() => {
                dispatchRef.current(searchClients({ query: currentQuery, page, limit: CLIENTS_PAGE_LIMIT }));
            });
        } else {
            startTransitionRef.current(() => {
                dispatchRef.current(fetchClients({ page, limit: CLIENTS_PAGE_LIMIT, status: currentStatus }));
            });
        }
    }, []); // Пустой массив зависимостей, так как используем refs

    // Мемоизируем примитивные значения из pagination для стабильности
    const paginationPage = pagination?.page ?? 1;
    const paginationTotalPages = pagination?.totalPages ?? 1;
    
    // Используем ref для хранения предыдущих paginationProps и предотвращения пересоздания
    const prevPaginationPropsRef = React.useRef<{
        currentPage: number;
        totalPages: number;
        canPreviousPage: boolean;
        canNextPage: boolean;
        onPageChange: (page: number) => void;
    } | null>(null);
    
    // Мемоизируем значения пагинации - используем только примитивные значения в зависимостях
    const paginationProps = useMemo(() => {
        const currentPage = paginationPage;
        const totalPages = paginationTotalPages;
        const canPreviousPage = currentPage > 1;
        const canNextPage = currentPage < totalPages;
        
        // Проверяем, изменились ли значения по сравнению с предыдущими
        const prev = prevPaginationPropsRef.current;
        if (prev && 
            prev.currentPage === currentPage &&
            prev.totalPages === totalPages &&
            prev.canPreviousPage === canPreviousPage &&
            prev.canNextPage === canNextPage &&
            prev.onPageChange === handlePageChange) {
            // Значения не изменились, возвращаем предыдущий объект
            return prev;
        }
        
        // Значения изменились, создаем новый объект
        const props = {
            currentPage,
            totalPages,
            canPreviousPage,
            canNextPage,
            onPageChange: handlePageChange,
        };
        
        prevPaginationPropsRef.current = props;
        return props;
    }, [paginationPage, paginationTotalPages, handlePageChange]);
    
    // Мемоизируем columnVisibility для предотвращения лишних перерисовок
    const memoizedColumnVisibility = useMemo(() => columnVisibility, [
        columnVisibility.name,
        columnVisibility.phone,
        columnVisibility.email,
        columnVisibility.address,
        columnVisibility.createdAt,
        columnVisibility.status,
        columnVisibility.actions,
    ]);

    console.log('[CLIENTS] tableData length:', tableData?.length, 'data:', tableData);
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
                {isLoading && !tableData?.length ? (
                    <ClientsTableSkeleton rowsCount={5}/>
                ) : (
                    <Table>
                        <ClientsTableHeader columns={columns} columnVisibility={memoizedColumnVisibility}/>
                        <ClientsTableBody clients={tableData} columns={columns} columnVisibility={memoizedColumnVisibility}/>
                    </Table>
                )}
            </div>
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                    Total: {pagination?.total ?? 0} clients
                </div>
                <TablePagination {...paginationProps} />
            </div>
        </div>
    );
};

export const OptimizedClientsTable = memo(OptimizedClientsTableComponent);

OptimizedClientsTable.displayName = 'OptimizedClientsTable';
