'use client';

import React from 'react';
import { TypographyH1, TypographyMuted } from '@/app/components/ui/typography';

export const CalendarPage: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div>
        <TypographyH1 className="text-2xl font-bold text-left">Calendar</TypographyH1>
        <TypographyMuted className="mt-1">
          Manage your schedule and appointments
        </TypographyMuted>
      </div>

      <div className="flex justify-center">
     
      </div>
    </div>
  );
};

