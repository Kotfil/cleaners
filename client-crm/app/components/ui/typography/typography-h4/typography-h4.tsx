'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyH4Props } from './typography-h4.types';

export const TypographyH4: React.FC<TypographyH4Props> = memo(({ children, className, ...props }) => {
  return (
    <h4
      className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}
      {...props}
    >
      {children}
    </h4>
  );
});

TypographyH4.displayName = 'TypographyH4';

