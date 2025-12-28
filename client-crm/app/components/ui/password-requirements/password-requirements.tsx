'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks/redux.hooks';
import { fetchPasswordRequirements } from '@/lib/store/slices/api-slice/api-slice';
import { PasswordRequirementsProps } from './password-requirements.types';
import { cn } from '@/helpers/utils';

export function PasswordRequirements({ password, isTouched }: PasswordRequirementsProps) {
    const dispatch = useAppDispatch();
    const passwordReqs = useAppSelector((state) => state.api.passwordRequirements);

    // Fetch password requirements from server on mount
    useEffect(() => {
        if (!passwordReqs) {
            dispatch(fetchPasswordRequirements());
        }
    }, [dispatch, passwordReqs]);

    // Use server requirements or fallback to defaults
    const minLength = passwordReqs?.minLength || 6;
    const requireUppercase = passwordReqs?.requireUppercase ?? true;
    const requireLowercase = passwordReqs?.requireLowercase ?? false;
    const requireNumber = passwordReqs?.requireNumber ?? false;
    const requireSpecialChar = passwordReqs?.requireSpecialChar ?? true;
    const specialChars = passwordReqs?.specialChars || '!@#$%^&*()_+-=[]{};\':"|,.<>/?';

    // Validate password against server requirements
    const hasMinLength = password.length >= minLength;
    const hasUppercase = requireUppercase ? /[A-Z]/.test(password) : true;
    const hasLowercase = requireLowercase ? /[a-z]/.test(password) : true;
    const hasNumber = requireNumber ? /[0-9]/.test(password) : true;
    const hasSpecialChar = requireSpecialChar ? new RegExp(`[${specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password) : true;

    // Show requirements immediately when user starts typing for instant feedback
    const shouldShow = password.length > 0;
    
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

    // Build requirements list dynamically based on server config
    const requirements = [
        { label: `At least ${minLength} characters`, isValid: hasMinLength },
        ...(requireUppercase ? [{ label: '1 uppercase letter', isValid: hasUppercase }] : []),
        ...(requireLowercase ? [{ label: '1 lowercase letter', isValid: hasLowercase }] : []),
        ...(requireNumber ? [{ label: '1 number', isValid: hasNumber }] : []),
        ...(requireSpecialChar ? [{ label: '1 special character', isValid: hasSpecialChar }] : []),
    ];

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

