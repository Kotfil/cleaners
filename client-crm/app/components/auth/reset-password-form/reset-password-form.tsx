'use client';

import {Form, Formik} from 'formik';
import {useEffect} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {toast} from 'sonner';
import {cn} from "@/helpers/utils";
import {FieldGroup} from "@/app/components/ui/field";
import {ResetPasswordFormValues} from "@/app/components/auth/reset-password-form/reset-password-form.types";
import {ResetPasswordFormTitle} from "@/app/components/auth/reset-password-form/reset-password-form-title";
import {ResetPasswordFormPassword} from "@/app/components/auth/reset-password-form/reset-password-form-password";
import {ResetPasswordFormButton} from "@/app/components/auth/reset-password-form/reset-password-form-button";
import {getResetPasswordValidationSchema} from "@/lib/store/utils/password-validation.utils";
import {resetPassword, clearError} from "@/lib/store/slices/auth-slice/auth-slice";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks/redux.hooks";

export function ResetPasswordForm({
                              className,
                              ...props
                          }: React.ComponentProps<"form">) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const {isLoading, error} = useAppSelector((state) => state.auth);
    const token = searchParams.get('token');

    useEffect(() => {
        // Clear error on mount
        dispatch(clearError());
        
        // Redirect if no token
        if (!token) {
            router.push('/forgot?error=Invalid reset link');
        }
    }, [dispatch, router, token]);

    const handleSubmit = async (values: ResetPasswordFormValues) => {
        if (!token) {
            return;
        }
        
        try {
            await dispatch(resetPassword({
                token,
                password: values.password,
                confirmPassword: values.confirmPassword,
            })).unwrap();
            // Show success toast
            toast.success('Password changed');
            // Redirect to login
            router.push('/login');
        } catch (error: any) {
            // Handle server password validation errors
            console.error('Reset password error:', error);
            
            let errorMessage = error?.message || 'Failed to reset password';
            
            // Check if server returned password-specific validation errors
            if (error?.errors && Array.isArray(error.errors)) {
                const passwordErrors = error.errors.filter((err: any) => 
                    err.field === 'password' || err.property === 'password'
                );
                if (passwordErrors.length > 0) {
                    errorMessage = passwordErrors.map((err: any) => err.message || err.constraints).join('; ');
                }
            }
            
            toast.error(errorMessage);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <Formik
            initialValues={{password: '', confirmPassword: ''}}
            validationSchema={getResetPasswordValidationSchema()}
            onSubmit={handleSubmit}
        >
             {({errors, touched, values}) => (
                 <Form className={cn("flex flex-col gap-6 transition-all duration-300 ease-in-out", className)} {...props}>
                     <FieldGroup>
                         <Link
                             href="/login"
                             className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 self-start"
                         >
                             <ArrowLeft className="h-4 w-4" />
                             <span>Back to login</span>
                         </Link>
                         <ResetPasswordFormTitle />

                         <ResetPasswordFormPassword 
                             isLoading={isLoading}
                             name="password"
                             label="New Password"
                             placeholder="Enter new password"
                             errorMessage={errors.password}
                             isTouched={touched.password}
                             passwordValue={values.password}
                             confirmPasswordValue={values.confirmPassword}
                             isConfirmTouched={touched.confirmPassword}
                         />

                         <ResetPasswordFormPassword 
                             isLoading={isLoading}
                             name="confirmPassword"
                             label="Confirm Password"
                             placeholder="Confirm new password"
                             errorMessage={errors.confirmPassword}
                             isTouched={touched.confirmPassword}
                         />

                         <ResetPasswordFormButton isLoading={isLoading} />
                     </FieldGroup>
                 </Form>
             )}
        </Formik>
    );
}

