"use client"

import {
  IconDotsVertical,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/components/ui/sidebar"

import { useAuth } from "@/lib/store/hooks/auth.hooks"
import { NavUserInfo } from "./nav-user-info"
import { NavUserList } from "./nav-user-list"

import { navUserMenuItems } from "./nav-user.data"
import { NavUserLogout } from "./nav-user-logout"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user: authUser, isLoading, getProfile, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
    
  // Загружаем профиль при монтировании компонента, если пользователь не загружен
  // НО только если есть accessToken в localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!authUser && !isLoading && accessToken) {
      getProfile();
    }
  }, [authUser, isLoading, getProfile]);

  // Функция logout для nav-user компонента
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Очищаем accessToken из localStorage (refreshToken cookie удаляется сервером)
      localStorage.removeItem('accessToken');
      // Перенаправляем на страницу логина
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если запрос не удался, очищаем accessToken
      localStorage.removeItem('accessToken');
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Используем данные из Redux store, если они есть, иначе fallback на пропсы
  const displayUser = authUser 

  // Формируем имя пользователя
  const fullName = displayUser?.name || displayUser?.email || 'User'

  // Получаем инициалы для аватара
  const initials = displayUser?.name 
    ? displayUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (displayUser?.email || 'U')[0].toUpperCase()


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={displayUser?.avatar} alt={fullName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {displayUser?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <NavUserInfo user={displayUser} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <NavUserList items={navUserMenuItems} />
            <DropdownMenuSeparator />
            <NavUserLogout onLogout={handleLogout} />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
