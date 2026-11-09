import { AppSidebar } from "@/components/app-sidebar"
import { LiveStatusBadge } from "@/components/mainlayout/live-status-badge"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <span className="font-semibold md:hidden">CubeDesk</span>
            <section className="lg:flex flex-col items-center justify-center mx-auto gap-6 hidden lg:visible">
              <LiveStatusBadge></LiveStatusBadge>
            </section>
          </header>
          <main className="p-4 md:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}