import {Field as FormikField} from 'formik';
import {Field, FieldLabel} from "@/app/components/ui/field";
import {Input} from "@/app/components/ui/input";
import {ResetPasswordFormPasswordProps} from './reset-password-form-password.types';
import {ErrorMessage} from "@/app/components/ui/error-message";
import {ResetPasswordRequirements} from "@/app/components/ui/reset-password-requirements";

export function ResetPasswordFormPassword({
                                   isLoading,
                                   name,
                                   label,
                                   placeholder,
                                   errorMessage,
                                   isTouched,
                                   passwordValue = '',
                                   confirmPasswordValue = '',
                                   isConfirmTouched = false
                               }: ResetPasswordFormPasswordProps) {
    const shouldShowError = Boolean(isTouched && errorMessage && errorMessage !== 'This field is required');
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
                {({field}: any) => (
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

