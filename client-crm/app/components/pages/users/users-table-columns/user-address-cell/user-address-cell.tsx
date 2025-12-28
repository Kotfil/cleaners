import React, { memo, useMemo } from 'react';
import { TypographyP } from '@/app/components/ui/typography';
import { UserAddressCellProps } from './user-address-cell.types';

export const UserAddressCell: React.FC<UserAddressCellProps> = memo(({ user }) => {
  // Формируем адрес из отдельных полей
  const address = useMemo(() => {
    // Используем formattedAddress если есть
    if (user.formattedAddress) {
      return user.formattedAddress;
    }
    
    // Иначе формируем из отдельных полей
    const parts = [
      user.street ? (user.street + (user.apt ? ' ' + user.apt : '')) : null,
      user.city,
      user.state,
      user.zipCode,
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : null;
  }, [user.formattedAddress, user.street, user.apt, user.city, user.state, user.zipCode]);

  if (!address) {
    return (
      <TypographyP className="text-sm text-muted-foreground">
        —
      </TypographyP>
    );
  }

  return (
    <TypographyP className="text-sm truncate" title={address}>
      {address}
    </TypographyP>
  );
});

UserAddressCell.displayName = 'UserAddressCell';

