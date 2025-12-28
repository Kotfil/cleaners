'use client';

import {useRouter} from 'next/navigation';
import {Form, Formik} from 'formik';
import {useEffect, useRef, useState} from 'react';
import {FieldGroup} from "@/app/components/ui/field";
import {cn} from "@/helpers/utils";
import {useAuth} from "@/lib/store/hooks/auth.hooks";
import {toast} from "sonner";
import {LoginFormValues} from "@/app/components/auth/login-form/login-form.types";
import {LoginFormTitle} from "@/app/components/auth/login-form/login-form-title";
import {LoginFormEmail} from "@/app/components/auth/login-form/login-form-email";
import {LoginFormPassword} from "@/app/components/auth/login-form/login-form-password";
import {LoginFormButton} from "@/app/components/auth/login-form/login-form-button";
import {LoginFormCaptcha, LoginFormCaptchaRef} from "@/app/components/auth/login-form/login-form-captcha";
import {getLoginValidationSchema} from "@/lib/store/utils/password-validation.utils";
import {env} from "@/lib/config/env";

const API_URL = env.apiUrl;

const FAILED_ATTEMPTS_KEY = 'loginFailedAttempts';
const FAILED_ATTEMPTS_THRESHOLD = 5;

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"form">) {
    const router = useRouter();
    const {signIn, isLoading, error, clearError} = useAuth();
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [requiresCaptcha, setRequiresCaptcha] = useState(false);
    const captchaRef = useRef<LoginFormCaptchaRef>(null);

    useEffect(() => {
        const checkCaptchaStatus = async () => {
            if (typeof window !== 'undefined') {
                // Проверяем сохраненный email для проверки статуса на сервере
                const lastEmail = localStorage.getItem('lastLoginEmail');
                if (lastEmail) {
                    try {
                        const response = await fetch(`${API_URL}/api/auth/captcha-status?email=${encodeURIComponent(lastEmail)}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.requiresCaptcha) {
                                setRequiresCaptcha(true);
                                setFailedAttempts(data.failedAttempts || 0);
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem(FAILED_ATTEMPTS_KEY, (data.failedAttempts || 0).toString());
                                }
                                return;
                            }
                        }
                    } catch (error) {
                        console.error('Failed to check captcha status:', error);
                    }
                }
                
                // Fallback на localStorage если нет email или не удалось получить статус
                const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
                const attempts = stored ? parseInt(stored, 10) : 0;
                setFailedAttempts(attempts);
                setRequiresCaptcha(attempts >= FAILED_ATTEMPTS_THRESHOLD);
            }
        };
        
        checkCaptchaStatus();
    }, []);

    const handleSubmit = async (values: LoginFormValues, {resetForm}: any) => {
        clearError();

        const captchaValue = requiresCaptcha ? captchaRef.current?.getValue() : null;
        
        if (requiresCaptcha && !captchaValue) {
            toast.error("Please complete the captcha");
            return;
        }

        // Сохраняем email для проверки статуса при перезагрузке
        if (typeof window !== 'undefined') {
            localStorage.setItem('lastLoginEmail', values.email);
        }

        const signInData: LoginFormValues = {
            ...values,
            captcha: captchaValue || undefined,
        };

        const result = await signIn(signInData);

        if (result.type.endsWith('/fulfilled') && result.payload) {
            const payload = result.payload as { accessToken: string; refreshToken?: string };

            // Сохраняем accessToken в localStorage (refreshToken в httpOnly cookie)
            if (payload.accessToken) {
                localStorage.setItem('accessToken', payload.accessToken);
            }

            // Сбрасываем счетчик неудачных попыток при успешном входе
            if (typeof window !== 'undefined') {
                localStorage.removeItem(FAILED_ATTEMPTS_KEY);
                localStorage.removeItem('lastLoginEmail');
                setFailedAttempts(0);
                setRequiresCaptcha(false);
                captchaRef.current?.reset();
            }

            // Показываем успешный toast
            toast.success("Login successful!");

            // Перенаправляем на chat
            router.push('/chat');
        } else if (result.type.endsWith('/rejected')) {
            // Пытаемся получить информацию о капче из ответа сервера
            const errorPayload = result.payload as any;
            let newAttempts = failedAttempts + 1;
            let requiresCaptcha = false;

            // Если сервер вернул информацию о попытках, используем её
            if (errorPayload && typeof errorPayload === 'string') {
                try {
                    const errorData = JSON.parse(errorPayload);
                    if (errorData.failedAttempts !== undefined) {
                        newAttempts = errorData.failedAttempts;
                        requiresCaptcha = errorData.requiresCaptcha || false;
                    }
                } catch {
                    // Если не JSON, используем локальное увеличение
                }
            } else if (errorPayload && typeof errorPayload === 'object' && errorPayload.failedAttempts !== undefined) {
                newAttempts = errorPayload.failedAttempts;
                requiresCaptcha = errorPayload.requiresCaptcha || false;
            }

            setFailedAttempts(newAttempts);
            setRequiresCaptcha(requiresCaptcha || newAttempts >= FAILED_ATTEMPTS_THRESHOLD);
            
            if (typeof window !== 'undefined') {
                localStorage.setItem(FAILED_ATTEMPTS_KEY, newAttempts.toString());
            }

            // Сбрасываем капчу при неудачной попытке
            if (captchaRef.current) {
                captchaRef.current.reset();
            }

            // Показываем ошибку через toast с деталями для паролей
            let errorMessage = errorPayload?.message || "Invalid credentials";
            
            // Check if server returned password-specific validation errors
            if (errorPayload?.errors && Array.isArray(errorPayload.errors)) {
                const passwordErrors = errorPayload.errors.filter((err: any) => 
                    err.field === 'password' || err.property === 'password'
                );
                if (passwordErrors.length > 0) {
                    errorMessage = passwordErrors.map((err: any) => err.message || err.constraints).join('; ');
                }
            }
            
            toast.error(errorMessage);
        }
    };

    return (
        <Formik
            initialValues={{email: '', password: '', captcha: ''}}
            validationSchema={getLoginValidationSchema()}
            onSubmit={handleSubmit}
        >
             {({errors, touched, values}) => (
                 <Form className={cn("flex flex-col gap-6 transition-all duration-300 ease-in-out", className)} {...props}>
                     <FieldGroup>
                         <LoginFormTitle />

                         <LoginFormEmail
                             isLoading={isLoading}
                             errorMessage={errors.email}
                             isTouched={touched.email}
                         />

                         <LoginFormPassword 
                             isLoading={isLoading}
                             passwordValue={values.password}
                         />

                         {requiresCaptcha && env.recaptchaSiteKey && (
                             <LoginFormCaptcha
                                 ref={captchaRef}
                                 siteKey={env.recaptchaSiteKey}
                             />
                         )}

                         <LoginFormButton isLoading={isLoading} />
                     </FieldGroup>
                 </Form>
             )}
        </Formik>
    );
}