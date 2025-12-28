'use client';

import React, { memo, useState, useEffect, useRef } from 'react';
import { ErrorMessageProps } from './error-message.types';
import { cn } from '@/helpers/utils';

const MAX_LENGTH = 100;

// Функция для нормализации children в строку для сравнения
const normalizeChildren = (children: React.ReactNode): string | null => {
  if (children === null || children === undefined) return null;
  if (typeof children === 'string') {
    const trimmed = children.trim();
    return trimmed || null;
  }
  if (typeof children === 'number') return String(children);
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    if (typeof props?.children === 'string') {
      const trimmed = props.children.trim();
      return trimmed || null;
    }
  }
  return null;
};

// Функция для обрезки текста до максимальной длины
const truncateText = (text: string | null, maxLength: number): string | null => {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const ErrorEmailLink: React.FC<ErrorMessageProps> = memo(({ children, className, ...props }) => {
  // Нормализуем children для сравнения
  const currentChildrenString = normalizeChildren(children);
  const truncatedText = truncateText(currentChildrenString, MAX_LENGTH);
  const hasChildren = Boolean(truncatedText);
  
  // Инициализируем состояние на основе начального значения children
  const [isVisible, setIsVisible] = useState(hasChildren);
  const [shouldRender, setShouldRender] = useState(hasChildren);
  const [isChanging, setIsChanging] = useState(false);
  const prevChildrenStringRef = useRef<string | null>(truncatedText);
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
    } else if (hasChildren && prevHasChildren && truncatedText !== prevChildrenStringRef.current) {
      // Если текст ошибки изменился, но ошибка все еще есть - добавляем анимацию смены текста
      setIsChanging(true);
      // Краткая анимация при смене текста (fade + scale)
      changeTimeoutRef.current = setTimeout(() => {
        setIsChanging(false);
        changeTimeoutRef.current = null;
      }, 200); // Время для плавной анимации смены текста
    }

    // Обновляем ref для следующего рендера
    prevChildrenStringRef.current = truncatedText;
  }, [hasChildren, truncatedText]);

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
        'text-sm text-destructive',
        'transition-all duration-300 ease-in-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-1',
        isChanging && 'opacity-60 scale-[0.98]',
        className
      )}
      {...props}
    >
      {truncatedText}
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для memo - сравниваем нормализованные строки
  const prevChildren = normalizeChildren(prevProps.children);
  const nextChildren = normalizeChildren(nextProps.children);
  const prevTruncated = truncateText(prevChildren, MAX_LENGTH);
  const nextTruncated = truncateText(nextChildren, MAX_LENGTH);
  
  return prevTruncated === nextTruncated && prevProps.className === nextProps.className;
});

ErrorEmailLink.displayName = 'ErrorEmailLink';

