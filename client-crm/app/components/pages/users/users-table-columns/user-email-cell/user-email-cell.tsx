import React, { memo } from 'react';
import { UserEmailCellProps } from './user-email-cell.types';

export const UserEmailCell: React.FC<UserEmailCellProps> = memo(({ user }) => {
  return (
    <div className="text-sm text-gray-900">
      <a 
        href={`mailto:${user.email}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {user.email}
      </a>
    </div>
  );
});

UserEmailCell.displayName = 'UserEmailCell';
