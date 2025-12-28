'use client';

import React, { memo, useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/helpers/utils';

interface FieldValidationMessageProps {
  error?: string | null;
  isValid?: boolean;
  className?: string;
}

// Функция для нормализации текста
const normalizeText = (text: string | null | undefined): string | null => {
  if (!text) return null;
  return text.trim() || null;
};

export const FieldValidationMessage: React.FC<FieldValidationMessageProps> = memo(({ 
  error, 
  isValid = false,
  className 
}) => {
  const errorText = normalizeText(error);
  const hasError = Boolean(errorText);
  const showSuccess = isValid && !hasError;
  
  // Инициализируем состояние
  const [isVisible, setIsVisible] = useState(hasError || showSuccess);
  const [shouldRender, setShouldRender] = useState(hasError || showSuccess);
  const [isChanging, setIsChanging] = useState(false);
  const prevStateRef = useRef<{ hasError: boolean; showSuccess: boolean; errorText: string | null }>({ 
    hasError, 
    showSuccess,
    errorText: errorText
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successRemoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Очищаем предыдущие таймауты
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (removeTimeoutRef.current) {
      clearTimeout(removeTimeoutRef.current);
      removeTimeoutRef.current = null;
    }
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    if (successRemoveTimeoutRef.current) {
      clearTimeout(successRemoveTimeoutRef.current);
      successRemoveTimeoutRef.current = null;
    }

    const prevHasError = prevStateRef.current.hasError;
    const prevShowSuccess = prevStateRef.current.showSuccess;
    const prevErrorText = prevStateRef.current.errorText || null;
    const currentErrorText = errorText;

    if (hasError && !prevHasError) {
      // Появление ошибки - отменяем процесс исчезновения и сразу показываем
      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current);
        removeTimeoutRef.current = null;
      }
      setShouldRender(true);
      setIsVisible(true);
      setIsChanging(false);
    } else if (!hasError && prevHasError) {
      // Исчезание ошибки
      setIsVisible(false);
      setIsChanging(false);
      removeTimeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        removeTimeoutRef.current = null;
      }, 300);
    } else if (hasError && prevHasError && currentErrorText !== prevErrorText) {
      // Смена текста ошибки - если текст изменился, но ошибка осталась
      setIsChanging(true);
      changeTimeoutRef.current = setTimeout(() => {
        setIsChanging(false);
        changeTimeoutRef.current = null;
      }, 200);
    } else if (hasError && prevHasError) {
      // Ошибка осталась и текст тот же - убеждаемся что видима
      // Отменяем процесс исчезновения если он был запущен
      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current);
        removeTimeoutRef.current = null;
      }
      if (!isVisible) {
        setIsVisible(true);
      }
      if (!shouldRender) {
        setShouldRender(true);
      }
      setIsChanging(false);
    }

    // Обработка успешной валидации
    if (showSuccess && !prevShowSuccess) {
      // Появление галочки
      setShouldRender(true);
      setIsVisible(true);
      // Автоматически скрываем галочку через 2 секунды
      successTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        successTimeoutRef.current = null;
        successRemoveTimeoutRef.current = setTimeout(() => {
          setShouldRender(false);
          successRemoveTimeoutRef.current = null;
        }, 300);
      }, 2000);
    } else if (!showSuccess && prevShowSuccess) {
      // Исчезание галочки
      setIsVisible(false);
      successRemoveTimeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        successRemoveTimeoutRef.current = null;
      }, 300);
    }

    // Обновляем ref
    prevStateRef.current = { hasError, showSuccess, errorText: currentErrorText };
  }, [hasError, showSuccess, errorText, error, isVisible, shouldRender]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      if (successRemoveTimeoutRef.current) clearTimeout(successRemoveTimeoutRef.current);
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        'transition-all duration-300 ease-in-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-1',
        isChanging && 'opacity-60 scale-[0.98]',
        hasError ? 'text-destructive' : 'text-green-600',
        className
      )}
    >
      {hasError ? (
        <>
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorText}</span>
        </>
      ) : showSuccess ? (
        <>
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span className="text-green-600">Valid</span>
        </>
      ) : null}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.error === nextProps.error &&
    prevProps.isValid === nextProps.isValid &&
    prevProps.className === nextProps.className
  );
});

FieldValidationMessage.displayName = 'FieldValidationMessage';

