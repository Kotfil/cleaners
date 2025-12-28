'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyInlineCodeProps } from './typography-inline-code.types';

export const TypographyInlineCode: React.FC<TypographyInlineCodeProps> = memo(({ children, className, ...props }) => {
  return (
    <code
      className={cn('bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)}
      {...props}
    >
      {children}
    </code>
  );
});

TypographyInlineCode.displayName = 'TypographyInlineCode';

