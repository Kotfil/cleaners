import { LucideIcon } from 'lucide-react';

export interface RoleCardViewProps {
  id: string;
  name: string;
  description?: string;
  icon: LucideIcon;
  rolePermissions?: string[];
  isSystem?: boolean;
}

export interface RolePermission {
  resource: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface Resource {
  key: string;
  label: string;
  hasCreate?: boolean;
  hasUpdate?: boolean;
  hasDelete?: boolean;
}

