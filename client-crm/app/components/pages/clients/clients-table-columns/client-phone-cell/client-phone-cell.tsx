'use client';

import React, { memo } from 'react';
import { ClientPhoneCellProps } from './client-phone-cell.types';

export const ClientPhoneCell: React.FC<ClientPhoneCellProps> = memo(({ phones }) => {
  if (!phones || phones.length === 0) {
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
    return <span>{displayPhone}</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium">{displayPhone}</span>
      <span className="text-xs text-muted-foreground">+{phones.length - 1} more</span>
    </div>
  );
});

ClientPhoneCell.displayName = 'ClientPhoneCell';
