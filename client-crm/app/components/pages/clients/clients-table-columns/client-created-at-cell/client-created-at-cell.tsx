'use client';

import React, { memo } from 'react';
import { ClientCreatedAtCellProps } from './client-created-at-cell.types';

export const ClientCreatedAtCell: React.FC<ClientCreatedAtCellProps> = memo(({ createdAt }) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="text-sm">
      {formattedDate}
    </div>
  );
});

ClientCreatedAtCell.displayName = 'ClientCreatedAtCell';
