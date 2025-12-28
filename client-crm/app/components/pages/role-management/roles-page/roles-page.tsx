'use client';

import React, { useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { TypographyMuted } from '@/app/components/ui/typography';
import { useRoles } from '@/lib/store/hooks/roles.hooks';
import { RoleCardList } from './role-card-list';
import { RolesTitle } from './roles-title';



export const RolesPage: React.FC = () => {
  const { roles, loading, error, fetchRoles } = useRoles();

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [roles.length, fetchRoles]);


  const handleRoleSuccess = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <TypographyMuted>Loading roles...</TypographyMuted>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <TypographyMuted className="text-destructive mb-4">
            Error loading roles: {error}
          </TypographyMuted>
          <Button onClick={fetchRoles} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RolesTitle onSuccess={handleRoleSuccess} />

      {roles.length === 0 ? (
        <div className="flex items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <TypographyMuted>No roles found</TypographyMuted>
          </div>
        </div>
      ) : (
        <RoleCardList roles={roles} />
      )}
    </div>
  );
};

