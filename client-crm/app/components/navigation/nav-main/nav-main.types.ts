import { type Icon } from "@tabler/icons-react"

/**
 * Navigation item structure for main navigation
 */
export interface NavMainItem {
  title: string
  url: string
  icon?: Icon
}

/**
 * Props for NavMain component
 */
export interface NavMainProps {
  items: NavMainItem[]
}
