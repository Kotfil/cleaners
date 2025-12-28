import React from 'react';

export interface ErrorMessageProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  showDot?: boolean;
}

