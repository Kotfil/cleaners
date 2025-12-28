import { Field as FormikField } from 'formik';
import { Field, FieldLabel } from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";
import { SignUpFormPasswordProps } from './sign-up-form-password.types';
import { ErrorMessage } from "@/app/components/ui/error-message";
import { ResetPasswordRequirements } from "@/app/components/ui/reset-password-requirements";

export function SignUpFormPassword({
  isLoading,
  name,
  label,
  placeholder,
  errorMessage,
  isTouched,
  passwordValue = '',
  confirmPasswordValue = '',
  isConfirmTouched = false
}: SignUpFormPasswordProps) {
  const shouldShowError = Boolean(isTouched && errorMessage && errorMessage !== ' ');
  const showRequirements = name === 'password';
  
  return (
    <Field>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <ErrorMessage 
          showDot 
          className="whitespace-nowrap text-xs text-right"
        >
          {shouldShowError ? errorMessage : null}
        </ErrorMessage>
      </div>
      <FormikField name={name}>
        {({ field }: any) => (
          <Input
            {...field}
            id={name}
            type="password"
            placeholder={placeholder}
            disabled={isLoading}
          />
        )}
      </FormikField>
      {showRequirements && (
        <ResetPasswordRequirements 
          password={passwordValue} 
          confirmPassword={confirmPasswordValue}
          isTouched={isTouched}
          isConfirmTouched={isConfirmTouched}
        />
      )}
    </Field>
  );
}

