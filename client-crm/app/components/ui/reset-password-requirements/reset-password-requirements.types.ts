export interface ResetPasswordRequirementsProps {
  password: string;
  confirmPassword: string;
  isTouched?: boolean;
  isConfirmTouched?: boolean;
}

export interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

