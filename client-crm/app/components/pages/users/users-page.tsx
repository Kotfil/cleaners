'use client';

import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { OptimizedUsersTable } from './users-table/optimized-users-table';

export const UsersPage: React.FC = memo(() => {
  const { error } = useSelector((state: RootState) => state.users);

  if (error) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <div className="text-center text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <OptimizedUsersTable loading={false} />
    </div>
  );
});

UsersPage.displayName = 'UsersPage';
