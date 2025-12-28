/**
 * Types for authentication slice state management
 */

export interface User {
  sub: string; // User ID
  email: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
  // Profile data from API (loaded via getProfile)
  id?: string;
  name?: string;
  avatar?: string;
  phone?: string;
  isActive?: boolean;
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
  user?: any;
}

export interface CreateUserPhoneRequest {
  number: string; // Format: +1234567890123 (exactly 16 chars)
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
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpWithTokenRequest {
  token: string;
  email: string;
  name?: string;
  password: string;
  confirmPassword: string;
  role: string;
  phones?: CreateUserPhoneRequest[];
}

export interface InviteUserRequest {
  email: string;
  role: string;
}