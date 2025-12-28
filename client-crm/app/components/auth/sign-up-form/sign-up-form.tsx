'use client';

import {Form, Formik} from 'formik';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {toast} from 'sonner';
import {cn} from "@/helpers/utils";
import {FieldGroup} from "@/app/components/ui/field";
import {Field as FormikField} from 'formik';
import {Field, FieldLabel} from "@/app/components/ui/field";
import {Input} from "@/app/components/ui/input";
import {Button} from "@/app/components/ui/button";
import {Spinner} from "@/app/components/ui/spinner";
import {SignUpFormValues} from "@/app/components/auth/sign-up-form/sign-up-form.types";
import {SignUpFormTitle} from "@/app/components/auth/sign-up-form/sign-up-form-title";
import {getSignUpFormValidationSchema} from "@/app/components/auth/sign-up-form/sign-up-form.validation";
import {signUpWithToken, clearError} from "@/lib/store/slices/auth-slice/auth-slice";
import {SignUpFormPassword} from "@/app/components/auth/sign-up-form/sign-up-form-password";
import {FieldValidationMessage} from "@/app/components/ui/error-message";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks/redux.hooks";
import {MultiPhoneInput} from "@/app/components/pages/users/users-controls/add-user-dialog/multi-phone-input";
import {authApi} from "@/lib/store/api/auth.api";

export function SignUpForm({
                              className,
                              ...props
                          }: React.ComponentProps<"form">) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const {isLoading, error} = useAppSelector((state) => state.auth);
    const token = searchParams.get('token');
    const [inviteEmail, setInviteEmail] = useState<string>('');
    const [loadingEmail, setLoadingEmail] = useState<boolean>(true);
    const [primaryPhone, setPrimaryPhone] = useState<string | null>(null);

    useEffect(() => {
        dispatch(clearError());
        
        if (!token) {
            router.push('/login?error=Invalid invitation link');
            return;
        }

        // Получаем email из токена приглашения
        const fetchInviteEmail = async () => {
            try {
                setLoadingEmail(true);
                const response = await authApi.getInviteEmail(token);
                setInviteEmail(response.data.email);
            } catch (error: any) {
                console.error('Failed to get invite email:', error);
                toast.error('Invalid or expired invitation link');
                router.push('/login?error=Invalid invitation link');
            } finally {
                setLoadingEmail(false);
            }
        };

        fetchInviteEmail();
    }, [dispatch, router, token]);

    const handleSubmit = async (values: SignUpFormValues) => {
        if (!token) {
            return;
        }
        
        try {
            // Подготовка телефонов
            const phones = values.phones && values.phones.length > 0
                ? values.phones.map((phone) => ({
                    number: phone,
                    isPrimary: phone === primaryPhone || (primaryPhone === null && phone === values.phones?.[0]),
                }))
                : undefined;

            await dispatch(signUpWithToken({
                token,
                email: values.email,
                name: values.name,
                password: values.password,
                confirmPassword: values.confirmPassword,
                role: '', // Роль берется из токена на сервере
                phones,
            })).unwrap();
            toast.success('Registration completed successfully');
            router.push('/login');
        } catch (error) {
            console.error('Sign up error:', error);
        }
    };

    if (!token || loadingEmail) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <Formik
            initialValues={{
                email: inviteEmail,
                name: '',
                password: '',
                confirmPassword: '',
                phones: [],
            }}
            enableReinitialize={true}
            validationSchema={getSignUpFormValidationSchema()}
            onSubmit={handleSubmit}
        >
             {({errors, touched, setFieldValue, values}) => (
                 <Form className={cn("flex flex-col gap-6", className)} {...props}>
                     <FieldGroup>
                         <Link
                             href="/login"
                             className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 self-start"
                         >
                             <ArrowLeft className="h-4 w-4" />
                             <span>Back to login</span>
                         </Link>
                         <SignUpFormTitle />

                         <div className="min-h-[3rem] space-y-1">
                             {errors.email && touched.email && (
                                 <div className="text-destructive text-sm">{errors.email}</div>
                             )}
                             {error && (
                                 <div className="text-destructive text-sm">{error}</div>
                             )}
                         </div>

                        <Field>
                            <FieldLabel htmlFor="email">Email *</FieldLabel>
                            <FormikField name="email">
                                {({field}: any) => (
                                    <Input
                                        {...field}
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        disabled={true}
                                        className="bg-muted cursor-not-allowed"
                                    />
                                )}
                            </FormikField>
                        </Field>

                        <Field>
                            <div className="flex items-center justify-between gap-3">
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <FieldValidationMessage
                                    error={touched.name ? errors.name : null}
                                    isValid={!!(touched.name && !errors.name && values.name)}
                                    className="whitespace-nowrap text-xs text-right"
                                />
                            </div>
                            <FormikField name="name">
                                {({field}: any) => (
                                   <Input
                                       {...field}
                                       id="name"
                                       placeholder="Enter full name"
                                       maxLength={30}
                                       disabled={isLoading}
                                   />
                                )}
                            </FormikField>
                        </Field>

                         <SignUpFormPassword 
                             isLoading={isLoading}
                             name="password"
                             label="Password *"
                             placeholder="Enter password"
                             errorMessage={errors.password}
                             isTouched={touched.password}
                             passwordValue={values.password}
                             confirmPasswordValue={values.confirmPassword}
                             isConfirmTouched={touched.confirmPassword}
                         />

                         <SignUpFormPassword 
                             isLoading={isLoading}
                             name="confirmPassword"
                             label="Confirm Password *"
                             placeholder="Confirm password"
                             errorMessage={errors.confirmPassword}
                             isTouched={touched.confirmPassword}
                         />

                         <Field>
                             <FieldLabel>Phone</FieldLabel>
                             <FormikField name="phones">
                                 {({field, form, meta}: any) => (
                                     <MultiPhoneInput
                                         phones={field.value || []}
                                         onPhonesChange={(phones: string[]) => form.setFieldValue('phones', phones)}
                                         onPrimaryPhoneChange={setPrimaryPhone}
                                         error={meta.touched && meta.error}
                                     />
                                 )}
                             </FormikField>
                         </Field>

                         <Field>
                             <Button type="submit" disabled={isLoading}>
                                 {isLoading ? (
                                     <>
                                         <Spinner size="sm" className="mr-2"/>
                                         Registering...
                                     </>
                                 ) : (
                                     'Complete Registration'
                                 )}
                             </Button>
                         </Field>
                     </FieldGroup>
                 </Form>
             )}
        </Formik>
    );
}

