export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[]; // Array of permission names from rolePermissions
  isSystem?: boolean; // Системная роль - нельзя удалить
  createdAt: string;
  updatedAt: string;
}

export interface RoleCounts {
  [key: string]: number;
}

export interface RolesState {
  roles: Role[];
  counts: RoleCounts;
  loading: boolean;
  error: string | null;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}
