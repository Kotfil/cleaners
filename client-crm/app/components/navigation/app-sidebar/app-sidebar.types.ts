import { type Icon } from "@tabler/icons-react"
import type { NavSecondaryItem } from "../nav-secondary/nav-secondary.types"

/**
 * User profile data structure
 */
export interface UserData {
  name: string
  email: string
  avatar: string
}

/**
 * Navigation item structure
 */
export interface NavItem {
  title: string
  url: string
  icon: Icon
  items?: {
    title: string
    url: string
  }[]
}

/**
 * Navigation data structure
 */
export interface NavData {
  user: UserData
  navMain: NavItem[]
  navSecondary: NavItem[]
}

/**
 * App sidebar configuration
 */
export interface AppSidebarConfig {
  brandName: string
  brandIcon: Icon
  navMain: NavItem[]
  navSecondary: NavSecondaryItem[]
}
