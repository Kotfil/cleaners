import * as Yup from 'yup';
import { store } from '../index';

/**
 * Dynamic password validation schema that syncs with server requirements
 * Uses Redux store to get current password requirements from API
 */
export function getPasswordValidationSchema(fieldName: string = 'password') {
  const state = store.getState();
  const reqs = state.api.passwordRequirements;

  // Fallback to defaults if server requirements not loaded
  const minLength = reqs?.minLength || 6;
  const maxLength = reqs?.maxLength || 25;
  const requireUppercase = reqs?.requireUppercase ?? true;
  const requireLowercase = reqs?.requireLowercase ?? false;
  const requireNumber = reqs?.requireNumber ?? false;
  const requireSpecialChar = reqs?.requireSpecialChar ?? true;
  const specialChars = reqs?.specialChars || '!@#$%^&*()_+-=[]{};\':"|,.<>/?';

  let schema = Yup.string()
    .min(minLength, `Password must be at least ${minLength} characters`)
    .max(maxLength, `Password must not exceed ${maxLength} characters`)
    .required(' ');

  // Add uppercase validation if required
  if (requireUppercase) {
    schema = schema.matches(/[A-Z]/, 'Password must contain at least 1 uppercase letter');
  }

  // Add lowercase validation if required
  if (requireLowercase) {
    schema = schema.matches(/[a-z]/, 'Password must contain at least 1 lowercase letter');
  }

  // Add number validation if required
  if (requireNumber) {
    schema = schema.matches(/[0-9]/, 'Password must contain at least 1 number');
  }

  // Add special character validation if required
  if (requireSpecialChar) {
    const escapedChars = specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    schema = schema.matches(
      new RegExp(`[${escapedChars}]`),
      'Password must contain at least 1 special character'
    );
  }

  return schema;
}

/**
 * Get dynamic validation schema for login form
 * Syncs password validation with server requirements
 */
export function getLoginValidationSchema() {
  return Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
      .required(' '),
    password: getPasswordValidationSchema('password'),
  });
}

/**
 * Get dynamic validation schema for reset password form
 * Syncs password validation with server requirements
 */
export function getResetPasswordValidationSchema() {
  return Yup.object({
    password: getPasswordValidationSchema('password'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required(' '),
  });
}

