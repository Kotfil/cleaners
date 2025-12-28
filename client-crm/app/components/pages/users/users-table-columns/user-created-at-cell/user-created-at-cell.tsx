import React, { memo } from 'react';
import { UserCreatedAtCellProps } from './user-created-at-cell.types';

export const UserCreatedAtCell: React.FC<UserCreatedAtCellProps> = memo(({ user }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="text-sm">
      {formatDate(user.createdAt)}
    </div>
  );
});

UserCreatedAtCell.displayName = 'UserCreatedAtCell';
