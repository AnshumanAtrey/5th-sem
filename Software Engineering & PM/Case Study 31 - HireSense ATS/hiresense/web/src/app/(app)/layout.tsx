import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 60)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
