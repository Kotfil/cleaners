import React, { memo } from 'react';
import { TypographyP } from '@/app/components/ui/typography';
import { UserNameCellProps } from './user-name-cell.types';

export const UserNameCell: React.FC<UserNameCellProps> = memo(({ user }) => {
  const displayName = user.name?.trim();
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user.email || 'U')[0].toUpperCase();

  const fallbackLabel = user.email || 'User';

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName || fallbackLabel}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {initials}
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <TypographyP className="text-sm font-medium truncate">
          {displayName}
        </TypographyP>
      </div>
    </div>
  );
});

UserNameCell.displayName = 'UserNameCell';
