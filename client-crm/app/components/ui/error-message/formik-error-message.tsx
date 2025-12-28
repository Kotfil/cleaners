'use client';

import React, { memo } from 'react';
import { useFormikContext } from 'formik';
import { ErrorMessage } from './error-message';

interface FormikErrorMessageWrapperProps {
  name: string;
}

/**
 * Wrapper component that always renders ErrorMessage to enable animations.
 * Uses useFormikContext to access errors directly, ensuring the component
 * is always rendered (even when error is null/undefined) for proper animations.
 */
export const FormikErrorMessageWrapper: React.FC<FormikErrorMessageWrapperProps> = memo(({ name }) => {
  const { errors, touched } = useFormikContext<any>();
  const error = touched[name] && errors[name] ? String(errors[name]) : null;

  return <ErrorMessage>{error}</ErrorMessage>;
});

FormikErrorMessageWrapper.displayName = 'FormikErrorMessageWrapper';

