export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPhone {
  id: string;
  number: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role; // Primary role
  secondaryRoles?: Role[]; // Secondary roles (optional array)
  phones?: UserPhone[];
  avatar?: string;
  status: 'active' | 'suspended' | 'archived';
  canSignIn: boolean;
  // Address fields
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
  formattedAddress?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
}
