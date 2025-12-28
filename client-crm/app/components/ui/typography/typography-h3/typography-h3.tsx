'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyH3Props } from './typography-h3.types';

export const TypographyH3: React.FC<TypographyH3Props> = memo(({ children, className, ...props }) => {
  return (
    <h3
      className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

TypographyH3.displayName = 'TypographyH3';

