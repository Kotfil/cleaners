'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyH2Props } from './typography-h2.types';

export const TypographyH2: React.FC<TypographyH2Props> = memo(({ children, className, ...props }) => {
  return (
    <h2
      className={cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', className)}
      {...props}
    >
      {children}
    </h2>
  );
});

TypographyH2.displayName = 'TypographyH2';

