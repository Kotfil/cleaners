export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: string[];
  phone?: string;
  avatar?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SignInRequest {
  email: string;
  password: string;
  captcha?: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface CreateUserPhoneRequest {
  number: string;
  isPrimary?: boolean;
}

export interface SignUpRequest {
  email: string;
  password?: string;
  name?: string;
  role: string; // Primary role
  secondaryRoles?: string[]; // Secondary roles (optional array)
  phones?: CreateUserPhoneRequest[];
  canSignIn?: boolean;
  // Address fields
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileResponse {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface PasswordRequirementsResponse {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  specialChars: string;
}