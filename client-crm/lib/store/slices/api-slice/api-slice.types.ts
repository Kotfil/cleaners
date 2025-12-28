/**
 * Types for API slice state management
 */

export interface ApiState {
  isLoading: boolean;
  error: string | null;
  passwordRequirements: PasswordRequirementsState | null;
}

export interface PasswordRequirementsState {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  specialChars: string;
  isLoading: boolean;
  error: string | null;
}
