'use client';

import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { OptimizedClientsTable } from '@/app/components/pages/clients/clients-table/optimized-clients-table';
import { TypographyH1 } from '@/app/components/ui/typography';

export const ClientsPage: React.FC = memo(() => {
  const { error } = useSelector((state: RootState) => state.clients);

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-1">
      <div className="pb-2">
        <TypographyH1 className="text-2xl font-bold text-left">Клиенты</TypographyH1>  
      </div>
      <OptimizedClientsTable />
    </div>
  );
});

ClientsPage.displayName = 'ClientsPage';
