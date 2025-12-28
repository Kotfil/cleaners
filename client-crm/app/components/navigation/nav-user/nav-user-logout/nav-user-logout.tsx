'use client';

import { IconLogout } from "@tabler/icons-react"
import {
  DropdownMenuItem,
} from "@/app/components/ui/dropdown-menu"

import { NavUserLogoutProps } from "./nav-user-logout.types"

/**
 * NavUserLogout component for logout functionality
 */
export const NavUserLogout = ({ onLogout }: NavUserLogoutProps) => {
  return (
    <DropdownMenuItem onClick={onLogout}>
      <IconLogout className="mr-2 h-4 w-4" />
      Log out
    </DropdownMenuItem>
  );
};
