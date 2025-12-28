'use client';

import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/app/components/ui/dropdown-menu"

import { NavUserListProps } from "../nav-user-list-types"

/**
 * NavUserList component for rendering menu items
 */
export const NavUserList = ({ items }: NavUserListProps) => {
  return (
    <DropdownMenuGroup>
      {items.map((item) => {
        const IconComponent = item.icon;
        return (
          <DropdownMenuItem key={item.id} onClick={item.onClick}>
            <IconComponent className="mr-2 h-4 w-4" />
            {item.label}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuGroup>
  );
};
