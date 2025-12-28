'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { PhoneInput } from '@/app/components/ui/phone-input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { Plus, Trash2, Star } from 'lucide-react';
import { cn } from '@/helpers/utils';
import { formatPhoneNumber } from '@/app/components/pages/chat/phone-formatter';

export interface PhonePopoverProps {
  phones: string[];
  onPhonesChange: (phones: string[]) => void;
  onPrimaryPhoneChange: (phone: string | null) => void;
  error?: boolean | string;
}

interface PhoneItem {
  value: string;
  isPrimary: boolean;
  isEditing: boolean;
}

export const PhonePopover: React.FC<PhonePopoverProps> = ({
  phones,
  onPhonesChange,
  onPrimaryPhoneChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [primaryPhone, setPrimaryPhone] = useState<string | null>(
    phones.length > 0 ? phones[0] : null
  );
  const [phoneInputs, setPhoneInputs] = useState<PhoneItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('+');
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Инициализация phoneInputs при открытии Popover
  React.useEffect(() => {
    // Очищаем предыдущий таймаут при открытии
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (isOpen) {
      if (phones.length === 0) {
        // Если нет номеров, создаем один пустой input для Primary
        setPhoneInputs([{ value: '', isPrimary: true, isEditing: true }]);
        setEditingIndex(0);
        setEditingValue('+');
      } else {
        // Преобразуем phones в PhoneItem
        const items: PhoneItem[] = phones.map((phone) => ({
          value: phone,
          isPrimary: phone === primaryPhone,
          isEditing: false,
        }));
        setPhoneInputs(items);
        setEditingIndex(null);
        setEditingValue('+');
      }
    } else {
      // При закрытии ждем завершения анимации перед сбросом состояния (200ms для анимации)
      closeTimeoutRef.current = setTimeout(() => {
        setEditingIndex(null);
        setEditingValue('+');
        closeTimeoutRef.current = null;
      }, 200);
    }

    // Очистка при размонтировании
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isOpen, phones, primaryPhone]);

  // Обновляем primaryPhone когда меняется phones
  React.useEffect(() => {
    if (phones.length > 0 && (!primaryPhone || !phones.includes(primaryPhone))) {
      const newPrimary = phones[0];
      setPrimaryPhone(newPrimary);
      onPrimaryPhoneChange(newPrimary);
    } else if (phones.length === 0) {
      setPrimaryPhone(null);
      onPrimaryPhoneChange(null);
    }
  }, [phones, primaryPhone, onPrimaryPhoneChange]);

  const handleAddPhone = useCallback((index: number, value: string) => {
    // Убираем форматирование для проверки
    const cleaned = value.replace(/[^\d+]/g, '');
    // Validate E.164 format: 11-20 characters starting with +
    if (cleaned && cleaned.length >= 11 && cleaned.length <= 20 && /^\+[0-9]+$/.test(cleaned) && !phones.includes(cleaned)) {
      const newPhones = [...phones, cleaned];
      onPhonesChange(newPhones);
      
      // Обновляем phoneInputs
      const newItems = [...phoneInputs];
      newItems[index] = { value: cleaned, isPrimary: index === 0 && phones.length === 0, isEditing: false };
      setPhoneInputs(newItems);
      setEditingIndex(null);
      
      // Если это первый номер, делаем его Primary
      if (phones.length === 0) {
        setPrimaryPhone(cleaned);
        onPrimaryPhoneChange(cleaned);
      }
    }
  }, [phones, phoneInputs, onPhonesChange, onPrimaryPhoneChange]);

  const handleDeletePhone = useCallback((phone: string) => {
    const newPhones = phones.filter(p => p !== phone);
    onPhonesChange(newPhones);
    
    if (phone === primaryPhone && newPhones.length > 0) {
      const newPrimary = newPhones[0];
      setPrimaryPhone(newPrimary);
      onPrimaryPhoneChange(newPrimary);
    }
  }, [phones, primaryPhone, onPhonesChange, onPrimaryPhoneChange]);

  const handleSetPrimary = useCallback((phone: string) => {
    setPrimaryPhone(phone);
    onPrimaryPhoneChange(phone);
  }, [onPrimaryPhoneChange]);

  const handleAddSecondary = useCallback(() => {
    const newItem: PhoneItem = { value: '', isPrimary: false, isEditing: true };
    const newItems = [...phoneInputs, newItem];
    setPhoneInputs(newItems);
    setEditingIndex(newItems.length - 1);
    setEditingValue('+');
  }, [phoneInputs]);

  const handleEditPhone = useCallback((index: number, phone: string) => {
    setEditingIndex(index);
    setEditingValue(phone);
    const newItems = [...phoneInputs];
    newItems[index].isEditing = true;
    setPhoneInputs(newItems);
  }, [phoneInputs]);

  const handleSaveEdit = useCallback((index: number, newValue: string) => {
    // Убираем форматирование для проверки
    const cleaned = newValue.replace(/[^\d+]/g, '');
    // Validate E.164 format: 11-20 characters starting with +
    if (cleaned && cleaned.length >= 11 && cleaned.length <= 20 && /^\+[0-9]+$/.test(cleaned)) {
      const oldPhone = phoneInputs[index].value;
      const newPhones = phones.map(p => p === oldPhone ? cleaned : p);
      onPhonesChange(newPhones);
      
      const newItems = [...phoneInputs];
      newItems[index] = { ...newItems[index], value: cleaned, isEditing: false };
      setPhoneInputs(newItems);
      setEditingIndex(null);
      
      if (oldPhone === primaryPhone) {
        setPrimaryPhone(cleaned);
        onPrimaryPhoneChange(cleaned);
      }
    }
  }, [phones, phoneInputs, primaryPhone, onPhonesChange, onPrimaryPhoneChange]);

  const handleCancelEdit = useCallback((index: number) => {
    const newItems = [...phoneInputs];
    newItems[index].isEditing = false;
    setPhoneInputs(newItems);
    setEditingIndex(null);
    setEditingValue('+');
  }, [phoneInputs]);

  const isValidPhone = (value: string): boolean => {
    const cleaned = value.replace(/[^\d+]/g, '');
    // E.164 format: 11-20 characters starting with +
    return cleaned.length >= 11 && cleaned.length <= 20 && /^\+[0-9]+$/.test(cleaned);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={error ? 'border-destructive' : ''}
        >
          <Plus className="h-4 w-4" />
          Add Phone
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        {isOpen && (
          <div className="space-y-4">
            {/* Header with Add Secondary button */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Phone Numbers</h4>
              {phones.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddSecondary}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Secondary Number
                </Button>
              )}
            </div>

            {/* Phone inputs list */}
            <div className="space-y-3">
              {phoneInputs.map((item, index) => {
              const isPrimary = item.value === primaryPhone;
              const isEditing = editingIndex === index;
              const canSetPrimary = phones.length >= 2 && !isPrimary;

              if (isEditing) {
                const showPrimaryLabel = (item.isPrimary || (phones.length === 0 && index === 0));
                return (
                  <div key={index} className="flex items-center gap-2">
                    {showPrimaryLabel && (
                      <div className="flex items-center justify-center w-20 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                        Primary
                      </div>
                    )}
                    {!showPrimaryLabel && <div className="w-20" />}
                    <PhoneInput
                      value={editingValue}
                      onChange={(value) => setEditingValue(value)}
                      className="flex-1 h-8"
                      placeholder="+1234567890123"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (item.value) {
                          handleSaveEdit(index, editingValue);
                        } else {
                          handleAddPhone(index, editingValue);
                        }
                      }}
                      disabled={!isValidPhone(editingValue)}
                      className="h-8"
                    >
                      {item.value ? 'Save' : 'Add'}
                    </Button>
                    {item.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelEdit(index)}
                        className="h-8"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                );
              }

              return (
                <div key={index} className="flex items-center gap-2">
                  {isPrimary && (
                    <div className="flex items-center justify-center w-20 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                      Primary
                    </div>
                  )}
                  {!isPrimary && <div className="w-20" />}
                  <div
                    onClick={() => handleEditPhone(index, item.value)}
                    className={cn(
                      "flex-1 h-8 px-3 py-1 rounded-md border bg-background text-sm cursor-pointer flex items-center",
                      isPrimary && "bg-muted",
                      "hover:bg-accent transition-colors"
                    )}
                  >
                    {formatPhoneNumber(item.value)}
                  </div>
                  {canSetPrimary && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(item.value)}
                      className="h-8 text-xs"
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePhone(item.value)}
                    className="h-8"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

