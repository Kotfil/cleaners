'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyLeadProps } from './typography-lead.types';

export const TypographyLead: React.FC<TypographyLeadProps> = memo(({ children, className, ...props }) => {
  return (
    <p
      className={cn('text-muted-foreground text-xl', className)}
      {...props}
    >
      {children}
    </p>
  );
});

TypographyLead.displayName = 'TypographyLead';

