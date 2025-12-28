'use client';

import React from 'react';
import { FieldValidationMessage } from './field-validation-message';
import { cn } from '@/helpers/utils';

interface PhoneErrorMessageProps {
  error?: string | null;
  className?: string;
}

/**
 * Animated validation message tailored for phone inputs.
 * Reuses FieldValidationMessage to keep behavior consistent.
 */
export const PhoneErrorMessage: React.FC<PhoneErrorMessageProps> = ({ error, className }) => {
  return (
    <FieldValidationMessage
      error={error}
      className={cn('text-xs', className)}
    />
  );
};

