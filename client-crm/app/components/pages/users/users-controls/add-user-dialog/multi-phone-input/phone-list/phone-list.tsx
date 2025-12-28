'use client';

import React from 'react';
import { PhoneListItem } from './phone-list-item';
import type { PhoneListProps } from './phone-list.types';

export const PhoneList: React.FC<PhoneListProps> = ({
  phones,
  selectedPhone,
  onPhoneSelect,
  onPhoneRemove,
  disabled = false,
}) => {
  if (phones.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2">
      {phones.map((phone) => (
        <PhoneListItem
          key={phone}
          phone={phone}
          isSelected={selectedPhone === phone}
          onSelect={onPhoneSelect}
          onRemove={onPhoneRemove}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

