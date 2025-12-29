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
  brandName: "Клінерсі CRM",
  brandIcon: IconInnerShadowTop,
  navMain: [

    {
      title: "Чат",
      url: "/chat",
      icon: IconMessage,
    },
    {
      title: "Календарь",
      url: "/calendar",
      icon: IconCalendarEvent,
    },
    {
      title: "Котировки",
      url: "/quotes",
      icon: IconCurrencyDollar,
    },
    {
      title: "Заказы",
      url: "/orders",
      icon: IconClipboardList,
    },
    {
      title: "Пользователи",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Команда компании",
      url: "/company-team",
      icon: IconBriefcase,
    },
    {
      title: "Движение денег",
      url: "/money-flow",
      icon: IconCash,
    },
    {
      title: "Клиенты",
      url: "/clients",
      icon: IconAddressBook,
    },
    {
      title: "Мой день уборки",
      url: "/my-cleaning-day",
      icon: IconSparkles,
    },
    {
      title: "Ценообразование",
      url: "/pricing",
      icon: IconMoneybag,
    },
  ],
  navSecondary: [
    {
      title: "Настройки",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Управление ролями",
      url: "/role-management",
      icon: IconShield,
    },
    {
      title: "Поиск",
      url: "/search",
      icon: IconSearch,
    },
  ],
}
