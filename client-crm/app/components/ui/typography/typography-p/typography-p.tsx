'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyPProps } from './typography-p.types';

export const TypographyP: React.FC<TypographyPProps> = memo(({ children, className, ...props }) => {
  return (
    <p
      className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
      {...props}
    >
      {children}
    </p>
  );
});

TypographyP.displayName = 'TypographyP';

