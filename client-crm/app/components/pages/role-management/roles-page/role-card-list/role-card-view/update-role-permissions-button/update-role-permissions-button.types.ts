
export interface UpdateRolePermissionsButtonProps {
  roleId: string;
  roleName: string;
  rolePermissions?: string[];
  onSuccess?: () => void;
}

