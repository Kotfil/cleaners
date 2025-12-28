
import { LogoutButton } from "@/app/components/auth"
import { Separator } from "@/app/components/ui/separator"
import { SidebarTrigger } from "@/app/components/ui/sidebar"
import { TypographyH1 } from "@/app/components/ui/typography"
import { HeaderProps } from "./header.types"
import {ModeToggle} from "@/app/components/ui/mode-toggle";

export function Header({ title = "", className, children }: HeaderProps) {
  return (
    <header className={`flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) ${className || ""}`}>
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <TypographyH1 className="text-base font-medium">{title}</TypographyH1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {children || <LogoutButton />}
        </div>
      </div>
    </header>
  )
}
