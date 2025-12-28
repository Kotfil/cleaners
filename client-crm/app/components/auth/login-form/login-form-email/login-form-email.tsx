import {Field as FormikField} from 'formik';
import {Field, FieldLabel} from "@/app/components/ui/field";
import {Input} from "@/app/components/ui/input";
import {LoginFormEmailProps} from '@/app/components/auth/login-form/login-form-email/login-form-email.types';
import {ErrorMessage} from "@/app/components/ui/error-message";

export function LoginFormEmail({
                                   isLoading,
                                   errorMessage,
                                   isTouched
                               }: LoginFormEmailProps) {
    const shouldShowError = Boolean(isTouched && errorMessage && errorMessage !== 'This field is required');
    
    return (
        <Field>
            <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <ErrorMessage 
                    showDot 
                    className="whitespace-nowrap text-xs text-right"
                >
                    {shouldShowError ? errorMessage : null}
                </ErrorMessage>
            </div>
            <FormikField name="email">
                {({field}: any) => (
                    <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Email"
                        disabled={isLoading}
                    />
                )}
            </FormikField>
        </Field>
    );
}
