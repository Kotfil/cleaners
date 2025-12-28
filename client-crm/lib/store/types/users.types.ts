export interface CreateUserPhoneRequest {
  number: string; // Format: +1234567890123 (exactly 16 chars)
  isPrimary?: boolean;
}

export interface CreateUserRequest {
  email: string;
  name?: string;
  role: string; // Primary role name for creation
  secondaryRoles?: string[]; // Secondary role names (optional array)
  password?: string;
  phones?: CreateUserPhoneRequest[];
  avatar?: string;
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
  canSignIn?: boolean;
  status?: 'active' | 'suspended' | 'archived';
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}
