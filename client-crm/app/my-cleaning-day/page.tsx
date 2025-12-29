import { AppSidebar } from "@/app/components/navigation/app-sidebar"
import { Header } from "@/app/components/layout/header"
import { TypographyH1, TypographyMuted } from "@/app/components/ui/typography"
import {
  SidebarInset,
  SidebarProvider,
} from "@/app/components/ui/sidebar"

export default function MyCleaningDayPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <TypographyH1 className="text-2xl font-bold text-left">Мой день уборки</TypographyH1>
                <TypographyMuted>My Cleaning Day  coming soon...</TypographyMuted>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
