import * as React from "react"
import { type Icon } from "@tabler/icons-react"

/**
 * Navigation item structure for secondary navigation
 */
export interface NavSecondaryItem {
  title: string
  url?: string
  icon: Icon
  items?: {
    title: string
    url: string
  }[]
}

/**
 * Props for NavSecondary component
 */
export interface NavSecondaryProps extends React.ComponentPropsWithoutRef<"div"> {
  items: NavSecondaryItem[]
  className?: string
}
