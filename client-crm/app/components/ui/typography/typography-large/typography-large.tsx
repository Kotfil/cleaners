'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyLargeProps } from './typography-large.types';

export const TypographyLarge: React.FC<TypographyLargeProps> = memo(({ children, className, ...props }) => {
  return (
    <div
      className={cn('text-lg font-semibold', className)}
      {...props}
    >
      {children}
    </div>
  );
});

TypographyLarge.displayName = 'TypographyLarge';

