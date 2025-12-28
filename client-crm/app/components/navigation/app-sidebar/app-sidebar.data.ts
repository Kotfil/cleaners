import {
  IconAddressBook,
  IconBriefcase,
  IconCalendarEvent,
  IconCash,
  IconClipboardList,
  IconCurrencyDollar,
  IconInnerShadowTop,
  IconMessage,
  IconMoneybag,
  IconSearch,
  IconSettings,
  IconShield,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react"

import { AppSidebarConfig } from "./app-sidebar.types"

/**
 * Application sidebar configuration data
 * Contains navigation structure and user information
 */
export const appSidebarData: AppSidebarConfig = {
  brandName: "Cleaners CRM",
  brandIcon: IconInnerShadowTop,
  navMain: [

    {
      title: "Chat",
      url: "/chat",
      icon: IconMessage,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: IconCalendarEvent,
    },
    {
      title: "Quotes",
      url: "/quotes",
      icon: IconCurrencyDollar,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconClipboardList,
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Company Team",
      url: "/company-team",
      icon: IconBriefcase,
    },
    {
      title: "Money Flow",
      url: "/money-flow",
      icon: IconCash,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: IconAddressBook,
    },
    {
      title: "My Cleaning Day",
      url: "/my-cleaning-day",
      icon: IconSparkles,
    },
    {
      title: "Pricing",
      url: "/pricing",
      icon: IconMoneybag,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Role Management",
      url: "/role-management",
      icon: IconShield,
    },
    {
      title: "Search",
      url: "/search",
      icon: IconSearch,
    },
  ],
}
