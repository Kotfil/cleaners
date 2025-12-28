'use client';

import React, { useState, useEffect } from 'react';
import { PhoneInput } from '@/app/components/ui/phone-input';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PhoneList } from './phone-list';
import { cleanPhoneNumber } from '@/app/components/pages/chat/phone-formatter';
import { usersApi } from '@/lib/store/api/users.api';
import type { MultiPhoneInputProps } from './multi-phone-input.types';

export const MultiPhoneInput: React.FC<MultiPhoneInputProps> = ({
  phones,
  onPhonesChange,
  onPrimaryPhoneChange,
  error,
  excludeUserId,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Автоматически выбираем первый номер, если нет выбранного или выбранный был удален
  useEffect(() => {
    if (phones.length > 0) {
      if (!selectedPhone || !phones.includes(selectedPhone)) {
        const firstPhone = phones[0];
        setSelectedPhone(firstPhone);
        onPrimaryPhoneChange?.(firstPhone);
      }
    } else {
      setSelectedPhone(null);
      onPrimaryPhoneChange?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phones]);

  const handleAdd = async () => {
    // cleanPhoneNumber converts formatted input to E.164 format (+XXXXXXXXXXX)
    const cleanedPhone = cleanPhoneNumber(inputValue);
    
    if (!cleanedPhone) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    // Validate phone length (11-20 characters for E.164 format)
    if (cleanedPhone.length < 11 || cleanedPhone.length > 20) {
      toast.error('Phone number must be between 11 and 20 characters');
      return;
    }
    
    if (phones.includes(cleanedPhone)) {
      toast.error('This phone number is already added');
      return;
    }
    
    if (phones.length >= 10) {
      toast.error('Maximum 10 phone numbers allowed');
      return;
    }
    
    // Check if phone exists in database
    setIsChecking(true);
    try {
      const response = await usersApi.checkPhoneExists(cleanedPhone, excludeUserId);
      
      if (response.data.exists) {
        toast.error('This phone number is already used by another user');
        setIsChecking(false);
        return;
      }
      
      // Phone is unique, add it
      onPhonesChange([...phones, cleanedPhone]);
      setInputValue('');
      toast.success('Phone number added');
    } catch (error: any) {
      console.error('Error checking phone:', error);
      toast.error('Failed to validate phone number');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRemove = (phone: string) => {
    onPhonesChange(phones.filter(p => p !== phone));
  };

  const handleBadgeClick = (phone: string) => {
    if (selectedPhone !== phone) {
      setSelectedPhone(phone);
      onPrimaryPhoneChange?.(phone);
      // Format phone for display: +1 (555) 123-4567
      const formatPhoneDisplay = (phone: string): string => {
        if (phone.startsWith('+1') && phone.length === 12) {
          const digits = phone.substring(2);
          return `+1 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
        }
        return phone;
      };
      toast.success(
        <>
          Primary Number{' '}
          <span className="font-semibold text-primary">{formatPhoneDisplay(phone)}</span>
        </>
      );
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <PhoneInput
          value={inputValue}
          onChange={setInputValue}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="+1(XXX)-XXX-XXXX"
          className={error ? 'border-destructive' : ''}
          disabled={disabled}
        />
        <Button 
          type="button" 
          onClick={handleAdd} 
          disabled={disabled || !inputValue.trim() || isChecking} 
          size="icon"
        >
          {isChecking ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
      <PhoneList
        phones={phones}
        selectedPhone={selectedPhone}
        onPhoneSelect={handleBadgeClick}
        onPhoneRemove={handleRemove}
        disabled={disabled}
      />
      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  );
};

