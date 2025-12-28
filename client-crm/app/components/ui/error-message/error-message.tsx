'use client';

import React, { memo, useState, useEffect, useRef } from 'react';
import { ErrorMessageProps } from './error-message.types';
import { cn } from '@/helpers/utils';

// Функция для нормализации children в строку для сравнения
const normalizeChildren = (children: React.ReactNode): string | null => {
  if (children === null || children === undefined) return null;
  if (typeof children === 'string') return children.trim() || null;
  if (typeof children === 'number') return String(children);
  if (React.isValidElement(children)) {
    // Для React элементов пытаемся получить текстовое содержимое
    const props = children.props as { children?: React.ReactNode };
    if (typeof props?.children === 'string') {
      return props.children.trim() || null;
    }
  }
  return null;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = memo(({ children, className, showDot = false, ...props }) => {
  // Нормализуем children для сравнения
  const currentChildrenString = normalizeChildren(children);
  const hasChildren = Boolean(currentChildrenString);
  
  // Инициализируем состояние на основе начального значения children
  const [isVisible, setIsVisible] = useState(hasChildren);
  const [shouldRender, setShouldRender] = useState(hasChildren);
  const [isChanging, setIsChanging] = useState(false);
  const prevChildrenStringRef = useRef<string | null>(currentChildrenString);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const prevHasChildren = Boolean(prevChildrenStringRef.current);

    if (hasChildren && !prevHasChildren) {
      // Появление: сразу показываем в DOM
      setShouldRender(true);
      // Небольшая задержка для анимации появления
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        timeoutRef.current = null;
      }, 10);
    } else if (!hasChildren && prevHasChildren) {
      // Исчезание: небольшая задержка для гарантии что браузер успел отрендерить текущее состояние
      // Затем запускаем анимацию исчезновения
      timeoutRef.current = setTimeout(() => {
        // Устанавливаем isVisible в false для начала анимации исчезновения
        setIsVisible(false);
        timeoutRef.current = null;
        // Удаляем из DOM после завершения анимации (300ms соответствует duration-300)
        removeTimeoutRef.current = setTimeout(() => {
          setShouldRender(false);
          removeTimeoutRef.current = null;
        }, 300);
      }, 16); // ~1 кадр при 60fps для гарантии рендера
    } else if (hasChildren && prevHasChildren && currentChildrenString !== prevChildrenStringRef.current) {
      // Если текст ошибки изменился, но ошибка все еще есть - добавляем анимацию смены текста
      setIsChanging(true);
      // Краткая анимация при смене текста (fade + scale)
      changeTimeoutRef.current = setTimeout(() => {
        setIsChanging(false);
        changeTimeoutRef.current = null;
      }, 200); // Время для плавной анимации смены текста
    }

    // Обновляем ref для следующего рендера
    prevChildrenStringRef.current = currentChildrenString;
  }, [hasChildren, currentChildrenString]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current);
      }
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={cn(
        'text-sm text-destructive text-center',
        'transition-all duration-300 ease-in-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-1',
        isChanging && 'opacity-60 scale-[0.98]',
        showDot && shouldRender && 'flex items-center gap-2',
        className
      )}
      {...props}
    >
      {/* Pulse dot keeps heartbeat of validation issue */}
      {showDot && shouldRender && (
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-destructive" />
      )}
      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для memo - сравниваем нормализованные строки
  const prevChildren = normalizeChildren(prevProps.children);
  const nextChildren = normalizeChildren(nextProps.children);
  
  return prevChildren === nextChildren && prevProps.className === nextProps.className && prevProps.showDot === nextProps.showDot;
});

ErrorMessage.displayName = 'ErrorMessage';

