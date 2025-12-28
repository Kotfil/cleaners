import { UsersTableSkeletonProps } from './users-table-skeleton.types';

export const getSkeletonRows = (rowsCount: number = 5): UsersTableSkeletonProps[] => {
  return Array.from({ length: rowsCount }, (_, index) => ({
    rowsCount: 1,
    key: `skeleton-row-${index}`
  }));
};
