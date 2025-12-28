export interface RolesCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId?: string; // Если передан, то режим редактирования
  roleName?: string;
  roleDescription?: string;
  rolePermissions?: string[]; // Array of permission IDs
  onSuccess?: () => void;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

