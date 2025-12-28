'use client';

import React, { memo } from 'react';
import { UserPhoneCellProps } from './user-phone-cell.types';

export const UserPhoneCell: React.FC<UserPhoneCellProps> = memo(({ user }) => {
  const phones = user.phones || [];
  
  if (phones.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  const primaryPhone = phones.find(p => p.isPrimary) || phones[0];
  
  // Format phone for display: +1 (555) 123-4567
  const formatPhoneDisplay = (phone: string): string => {
    if (phone.startsWith('+1') && phone.length === 12) {
      const digits = phone.substring(2);
      return `+1 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    return phone;
  };
  
  const displayPhone = formatPhoneDisplay(primaryPhone.number);
  
  if (phones.length === 1) {
    return (
      <a 
        href={`tel:${primaryPhone.number}`}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {displayPhone}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <a 
        href={`tel:${primaryPhone.number}`}
        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
      >
        {displayPhone}
      </a>
      <span className="text-xs text-muted-foreground">+{phones.length - 1} more</span>
    </div>
  );
});

UserPhoneCell.displayName = 'UserPhoneCell';
