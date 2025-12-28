export interface ViewRolePermissionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  roleName: string;
  rolePermissions?: string[];
}

