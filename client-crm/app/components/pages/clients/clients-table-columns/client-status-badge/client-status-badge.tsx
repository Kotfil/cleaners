'use client';

import React, { memo } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { ClientStatusBadgeProps } from './client-status-badge.types';

export const ClientStatusBadge: React.FC<ClientStatusBadgeProps> = memo(({ status }) => {
  // Определяем вариант badge и текст на основе статуса
  const getBadgeVariant = () => {
    switch (status) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (status) {
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
    <Badge variant={getBadgeVariant()}>
      {getStatusText()}
    </Badge>
  );
});

ClientStatusBadge.displayName = 'ClientStatusBadge';
