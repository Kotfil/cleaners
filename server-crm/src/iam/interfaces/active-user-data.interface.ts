import { Permission } from '../../enums/permission.enum';

export interface ActiveUserData {
  sub: string; // User ID
  email: string;
  role: string; // Role name instead of enum
  permissions: Permission[];
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
}
