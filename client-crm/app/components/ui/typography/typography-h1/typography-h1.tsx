'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyH1Props } from './typography-h1.types';

export const TypographyH1: React.FC<TypographyH1Props> = memo(({ children, className, ...props }) => {
  return (
    <h1
      className={cn('scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance', className)}
      {...props}
    >
      {children}
    </h1>
  );
});

TypographyH1.displayName = 'TypographyH1';

