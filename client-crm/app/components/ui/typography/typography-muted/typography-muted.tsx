'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyMutedProps } from './typography-muted.types';

export const TypographyMuted: React.FC<TypographyMutedProps> = memo(({ children, className, ...props }) => {
  return (
    <p
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    >
      {children}
    </p>
  );
});

TypographyMuted.displayName = 'TypographyMuted';

