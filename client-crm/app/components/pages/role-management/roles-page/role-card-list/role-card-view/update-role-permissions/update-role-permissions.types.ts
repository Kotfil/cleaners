export interface UpdateRolePermissionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  roleName: string;
  rolePermissions?: string[]; // Array of permission IDs
  onSuccess?: () => void;
}









