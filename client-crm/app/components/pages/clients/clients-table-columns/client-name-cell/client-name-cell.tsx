'use client';

import React, { memo } from 'react';
import { ClientNameCellProps } from './client-name-cell.types';

export const ClientNameCell: React.FC<ClientNameCellProps> = memo(({ name }) => {
  return (
    <div className="font-medium">
      {name || '-'}
    </div>
  );
});

ClientNameCell.displayName = 'ClientNameCell';
