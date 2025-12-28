'use client';

import React, { memo } from 'react';
import { ClientAddressCellProps } from './client-address-cell.types';

export const ClientAddressCell: React.FC<ClientAddressCellProps> = memo(({ address, city, state }) => {
  if (!address && !city && !state) {
    return '-';
  }
  
  return (
    <div className="text-sm">
      {address && <div>{address}</div>}
      {city && state && <div>{city}, {state}</div>}
      {city && !state && <div>{city}</div>}
      {!city && state && <div>{state}</div>}
    </div>
  );
});

ClientAddressCell.displayName = 'ClientAddressCell';
