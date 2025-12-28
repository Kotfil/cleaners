'use client';

import React from 'react';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { X } from 'lucide-react';
import { cn } from '@/helpers/utils';
import { formatUsPhone } from '@/lib/utils/phone.utils';

export interface CheckboxPhoneProps {
  phone: string;
  isPrimary: boolean;
  onPrimaryChange: (phone: string, isPrimary: boolean) => void;
  onDelete: (phone: string) => void;
  disabled?: boolean;
  canUncheck?: boolean; // Разрешить снимать чекбокс (если это не единственный телефон)
}

export const CheckboxPhone: React.FC<CheckboxPhoneProps> = ({
  phone,
  isPrimary,
  onPrimaryChange,
  onDelete,
  disabled = false,
  canUncheck = true,
}) => {
  const handleCheckboxChange = (checked: boolean) => {
    if (!disabled && (checked || canUncheck)) {
      onPrimaryChange(phone, checked);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onDelete(phone);
    }
  };

  return (
    <Label
      className={cn(
        'hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
        'has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50',
        'dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Checkbox
        id={`phone-${phone}`}
        checked={isPrimary}
        onCheckedChange={handleCheckboxChange}
        disabled={disabled}
        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700 mt-0.5"
      />
      <div className="grid gap-1.5 font-normal flex-1">
        <p className="text-sm leading-none font-medium">
          {formatUsPhone(phone)}
        </p>
        {isPrimary && (
          <p className="text-muted-foreground text-sm">
            Primary phone
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled}
        className={cn(
          'ml-auto text-destructive hover:text-destructive/80 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Delete phone"
      >
        <X className="h-4 w-4" />
      </button>
    </Label>
  );
};

