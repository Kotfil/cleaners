'use client';

import React, { memo } from 'react';
import { ClientEmailCellProps } from './client-email-cell.types';

export const ClientEmailCell: React.FC<ClientEmailCellProps> = memo(({ email }) => {
  if (!email) {
    return <div className="text-sm text-muted-foreground">-</div>;
  }
  return (
    <div className="text-sm">
      <a 
        href={`mailto:${email}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {email}
      </a>
    </div>
  );
});

ClientEmailCell.displayName = 'ClientEmailCell';
