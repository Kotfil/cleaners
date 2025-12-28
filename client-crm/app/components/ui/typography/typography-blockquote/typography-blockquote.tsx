'use client';

import React, { memo } from 'react';
import { cn } from '@/helpers/utils';
import { TypographyBlockquoteProps } from './typography-blockquote.types';

export const TypographyBlockquote: React.FC<TypographyBlockquoteProps> = memo(({ children, className, ...props }) => {
  return (
    <blockquote
      className={cn('mt-6 border-l-2 pl-6 italic', className)}
      {...props}
    >
      {children}
    </blockquote>
  );
});

TypographyBlockquote.displayName = 'TypographyBlockquote';

