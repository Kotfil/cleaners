'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyListProps } from './typography-list.types';

export const TypographyList: React.FC<TypographyListProps> = memo(({ children, className, ...props }) => {
  return (
    <ul
      className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)}
      {...props}
    >
      {children}
    </ul>
  );
});

TypographyList.displayName = 'TypographyList';

