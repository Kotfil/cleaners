'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographySmallProps } from './typography-small.types';

export const TypographySmall: React.FC<TypographySmallProps> = memo(({ children, className, ...props }) => {
  return (
    <small
      className={cn('text-sm leading-none font-medium', className)}
      {...props}
    >
      {children}
    </small>
  );
});

TypographySmall.displayName = 'TypographySmall';

