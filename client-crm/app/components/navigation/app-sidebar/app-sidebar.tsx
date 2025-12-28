"use client"

import * as React from "react"

import { NavMain } from "../nav-main"
import { NavSecondary } from "../nav-secondary"
import { NavUser } from "../nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"

import { appSidebarData } from "./app-sidebar.data"
import { useAuth } from '@/lib/store/hooks/auth.hooks'
import { canAccessRoute } from '@/lib/utils/route-permissions.utils'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { brandName, brandIcon: BrandIcon, navMain, navSecondary } = appSidebarData
  const { user } = useAuth()

  // Функция проверки доступа к странице (динамическая, из JWT permissions)
  const canAccessPage = (url: string): boolean => {
    return canAccessRoute(url, user?.permissions || [])
  }

  // Фильтруем навигацию
  const filteredNavMain = React.useMemo(
    () => navMain.filter(item => item.url && canAccessPage(item.url)),
    [navMain, user?.permissions]
  )
  const filteredNavSecondary = navSecondary
    .map(item => {
      if (item.items) {
        // Фильтруем подменю
        const filteredItems = item.items.filter(subItem => subItem.url && canAccessPage(subItem.url))
        return filteredItems.length > 0 ? { ...item, items: filteredItems } : null
      }
      return item.url && canAccessPage(item.url) ? item : null
    })
    .filter(Boolean)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/chat">
                <BrandIcon className="!size-5" />
                <span className="text-base font-semibold">{brandName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={filteredNavSecondary as any} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
