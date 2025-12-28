'use client';

import React from 'react';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';
import type { PhoneListItemProps } from './phone-list-item.types';

export const PhoneListItem: React.FC<PhoneListItemProps> = ({
  phone,
  isSelected,
  onSelect,
  onRemove,
  disabled = false,
}) => {
  // Format phone for display: +1 (555) 123-4567
  const formatPhoneDisplay = (phone: string): string => {
    if (phone.startsWith('+1') && phone.length === 12) {
      // US/Canada format: +1 (555) 123-4567
      const digits = phone.substring(2); // Remove +1
      return `+1 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    // For other countries, just display as is
    return phone;
  };
  
  return (
    <Label className={`hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950`}>
      <Checkbox
        id={`phone-${phone}`}
        checked={isSelected}
        onCheckedChange={() => !disabled && onSelect(phone)}
        disabled={disabled}
        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
      />
      <div className="grid gap-0.5 font-normal flex-1">
        <p className="text-sm leading-none font-medium font-mono">
          {formatPhoneDisplay(phone)}
        </p>
        <p className="text-muted-foreground text-xs">
          {isSelected ? 'Primary phone number' : 'Click checkbox to set as primary'}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            onRemove(phone);
          }
        }}
        disabled={disabled}
      >
        <X className="h-4 w-4" />
      </Button>
    </Label>
  );
};

