'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    PASSWORD_MIN_LENGTH, 
    PASSWORD_UPPERCASE_REGEX, 
    PASSWORD_SPECIAL_CHAR_REGEX 
} from '@/app/components/auth/validation.constants';
import { ResetPasswordRequirementsProps } from './reset-password-requirements.types';
import { RESET_PASSWORD_REQUIREMENTS_LIST } from './reset-password-requirements.list';
import { cn } from '@/helpers/utils';

export function ResetPasswordRequirements({ 
    password, 
    confirmPassword, 
    isTouched, 
    isConfirmTouched 
}: ResetPasswordRequirementsProps) {
    const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;
    const hasUppercase = PASSWORD_UPPERCASE_REGEX.test(password);
    const hasSpecialChar = PASSWORD_SPECIAL_CHAR_REGEX.test(password);
    const passwordsMatch = password === confirmPassword && password.length > 0 && confirmPassword.length > 0;

    const shouldShow = (isTouched && password.length > 0) || (isConfirmTouched && confirmPassword.length > 0);
    
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (removeTimeoutRef.current) {
            clearTimeout(removeTimeoutRef.current);
            removeTimeoutRef.current = null;
        }

        if (shouldShow) {
            // Появление: сразу показываем в DOM
            setShouldRender(true);
            // Задержка для анимации появления
            timeoutRef.current = setTimeout(() => {
                setIsVisible(true);
                timeoutRef.current = null;
            }, 10);
        } else {
            // Исчезание: анимация
            setIsVisible(false);
            // Удаляем из DOM после анимации
            removeTimeoutRef.current = setTimeout(() => {
                setShouldRender(false);
                removeTimeoutRef.current = null;
            }, 300);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);
        };
    }, [shouldShow]);

    if (!shouldRender) {
        return null;
    }

    const validationMap = {
        minLength: hasMinLength,
        uppercase: hasUppercase,
        specialChar: hasSpecialChar,
        passwordsMatch: passwordsMatch,
    };

    const requirements = RESET_PASSWORD_REQUIREMENTS_LIST.map(req => ({
        label: req.label,
        isValid: validationMap[req.key as keyof typeof validationMap],
    }));

    return (
        <div className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs",
            "transition-all duration-300 ease-in-out",
            isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-1"
        )}>
            {requirements.map((req, index) => (
                <div 
                    key={index} 
                    className={cn(
                        "flex items-center gap-1.5",
                        "transition-all duration-300 ease-in-out",
                        isVisible
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2"
                    )}
                    style={{
                        transitionDelay: isVisible ? `${index * 50}ms` : '0ms'
                    }}
                >
                    <div className={cn(
                        "size-1.5 rounded-full transition-all duration-300",
                        req.isValid ? "bg-green-500 scale-100" : "bg-red-500 scale-90"
                    )} />
                    <span className={cn(
                        "transition-colors duration-300 whitespace-nowrap",
                        req.isValid ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                    )}>
                        {req.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

