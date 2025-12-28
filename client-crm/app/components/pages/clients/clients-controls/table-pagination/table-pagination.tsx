'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/app/components/ui/pagination';
import React, { memo, useCallback } from 'react';
import { TablePaginationProps } from './table-pagination.types';

const TablePaginationComponent: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  canPreviousPage,
  canNextPage
}) => {
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }, [onPageChange, totalPages]);

  const handlePrevious = useCallback(() => {
    if (canPreviousPage) {
      handlePageChange(currentPage - 1);
    }
  }, [canPreviousPage, currentPage, handlePageChange]);

  const handleNext = useCallback(() => {
    if (canNextPage) {
      handlePageChange(currentPage + 1);
    }
  }, [canNextPage, currentPage, handlePageChange]);

  // Генерируем массив страниц для отображения
  const getPageNumbers = useCallback(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Показываем первую страницу
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Показываем страницы вокруг текущей
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Показываем последнюю страницу
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const pageNumbers = getPageNumbers();

  // Показываем пагинацию только если есть больше 1 страницы
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePrevious();
              }}
              className={!canPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className={!canNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export const TablePagination = memo(TablePaginationComponent, (prevProps, nextProps) => {
  // Функция сравнения для предотвращения лишних перерисовок
  return (
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages &&
    prevProps.canPreviousPage === nextProps.canPreviousPage &&
    prevProps.canNextPage === nextProps.canNextPage &&
    prevProps.onPageChange === nextProps.onPageChange
  );
});

TablePagination.displayName = 'TablePagination';
