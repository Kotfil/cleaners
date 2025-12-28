'use client';

import {Form, Formik} from 'formik';
import {useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {toast} from 'sonner';
import {cn} from "@/helpers/utils";
import {FieldGroup} from "@/app/components/ui/field";
import {ForgotFormValues} from "@/app/components/auth/forgot-form/forgot-form.types";
import {ForgotFormTitle} from "@/app/components/auth/forgot-form/forgot-form-title";
import {ForgotFormEmail} from "@/app/components/auth/forgot-form/forgot-form-email";
import {ForgotFormButton} from "@/app/components/auth/forgot-form/forgot-form-button";
import {forgotFormValidationSchema} from "@/app/components/auth/forgot-form/forgot-form.validation";
import {forgotPassword, clearError} from "@/lib/store/slices/auth-slice/auth-slice";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks/redux.hooks";

export function ForgotForm({
                              className,
                              ...props
                          }: React.ComponentProps<"form">) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const {isLoading, error} = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Clear error on mount
        dispatch(clearError());
    }, [dispatch]);

    const handleSubmit = async (values: ForgotFormValues) => {
        try {
            await dispatch(forgotPassword({email: values.email})).unwrap();
            // Show success toast
            toast.success('Check your email, instructions for password recovery are there');
            // Redirect to login
            router.push('/login');
        } catch (error: any) {
            // unwrap() returns rejectWithValue directly as string
            const errorMessage = typeof error === 'string' ? error : (error?.message || 'Failed to send reset email');
            toast.error(errorMessage);
        }
    };

    return (
        <Formik
            initialValues={{email: ''}}
            validationSchema={forgotFormValidationSchema}
            onSubmit={handleSubmit}
        >
             {({errors, touched}) => (
                 <Form className={cn("flex flex-col gap-6 transition-all duration-300 ease-in-out", className)} {...props}>
                     <FieldGroup>
                         <Link
                             href="/login"
                             className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 self-start"
                         >
                             <ArrowLeft className="h-4 w-4" />
                             <span>Back to login</span>
                         </Link>
                         <ForgotFormTitle />

                         <ForgotFormEmail
                             isLoading={isLoading}
                             errorMessage={errors.email}
                             isTouched={touched.email}
                         />

                         <ForgotFormButton isLoading={isLoading} />
                     </FieldGroup>
                 </Form>
             )}
        </Formik>
    );
}

