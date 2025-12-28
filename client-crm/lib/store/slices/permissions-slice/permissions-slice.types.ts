export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

