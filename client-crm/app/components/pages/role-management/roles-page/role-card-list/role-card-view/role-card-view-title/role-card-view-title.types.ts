import { LucideIcon } from 'lucide-react';


export interface RoleCardViewTitleProps {
  id: string;
  name: string;
  description?: string;
  icon: LucideIcon;
  isSystem: boolean;
  rolePermissions?: string[]; // Permission names array (e.g., ["user:create", "user:read"])
  onDeleteSuccess: () => void;
}

