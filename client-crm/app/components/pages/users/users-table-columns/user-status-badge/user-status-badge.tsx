import React, { memo } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { UserStatusBadgeProps } from './user-status-badge.types';

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = memo(({ user }) => {
  const getStatusVariant = () => {
    switch (user.status) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'secondary';
      case 'archived':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = () => {
    switch (user.status) {
      case 'active':
        return 'Active';
      case 'suspended':
        return 'Suspended';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant={getStatusVariant()}>
      {getStatusLabel()}
    </Badge>
  );
});

UserStatusBadge.displayName = 'UserStatusBadge';
