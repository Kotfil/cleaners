"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/components/ui/sidebar"

import { NavMainProps } from "./nav-main.types"

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  const previousPathnameRef = useRef<string | null>(null)

  // Закрываем sidebar при изменении pathname (только на мобильных)
  // Это позволяет анимации закрытия проиграть параллельно с навигацией
  useEffect(() => {
    if (isMobile && openMobile && previousPathnameRef.current !== null && previousPathnameRef.current !== pathname) {
      // Закрываем sidebar сразу, анимация проиграет автоматически через CSS
      setOpenMobile(false)
    }
    previousPathnameRef.current = pathname
  }, [pathname, isMobile, openMobile, setOpenMobile])

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  className={isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear" : ""}
                >
                  <Link 
                    href={item.url}
                    onClick={() => {
                      // Закрываем sidebar сразу при клике на мобильных (без задержки навигации)
                      if (isMobile && openMobile) {
                        setOpenMobile(false)
                      }
                    }}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
