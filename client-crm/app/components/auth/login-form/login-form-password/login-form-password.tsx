import { Field as FormikField } from 'formik';
import { Field, FieldLabel } from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";
import { LoginFormPasswordProps } from '@/app/components/auth/login-form/login-form-password/login-form-password.types';
import { useAppSelector } from "@/lib/store/hooks/redux.hooks";

export function LoginFormPassword({ 
  isLoading,
  passwordValue = ''
}: LoginFormPasswordProps) {
  // Get maxLength from server requirements for sync with validation
  const passwordReqs = useAppSelector((state) => state.api.passwordRequirements);
  const maxLength = passwordReqs?.maxLength || 25;
  
  return (
    <Field>
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <FormikField name="password">
        {({ field }: any) => (
          <Input
            {...field}
            id="password"
            type="password"
            maxLength={maxLength}
            disabled={isLoading}
          />
        )}
      </FormikField>
    </Field>
  );
}
