/**
 * Types for NavUserInfo component
 */

export interface NavUserInfoProps {
  user: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
}
