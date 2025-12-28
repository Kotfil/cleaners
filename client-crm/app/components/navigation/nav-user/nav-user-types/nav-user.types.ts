/**
 * User profile data structure
 */
export interface UserData {
  name: string
  email: string
  avatar: string
}

/**
 * Props for NavUser component
 */
export interface NavUserProps {
  user: UserData
}
