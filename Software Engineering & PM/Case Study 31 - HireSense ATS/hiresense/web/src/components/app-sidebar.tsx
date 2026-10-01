"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BriefcaseBusinessIcon,
  FileSearchIcon,
  GitCompareArrowsIcon,
  InboxIcon,
  LayoutDashboardIcon,
  ScaleIcon,
  ScrollTextIcon,
  UploadIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ThemeSwitcher } from "@/components/theme-switcher"

const NAV = [
  {
    label: "Screening",
    items: [
      { title: "Overview", url: "/", icon: LayoutDashboardIcon },
      { title: "Jobs", url: "/jobs", icon: BriefcaseBusinessIcon },
      { title: "Review queue", url: "/review", icon: InboxIcon },
      { title: "Compare", url: "/compare", icon: GitCompareArrowsIcon },
    ],
  },
  {
    label: "Accountability",
    items: [
      { title: "Decision log", url: "/decisions", icon: ScrollTextIcon },
      { title: "Bias audit", url: "/audit", icon: ScaleIcon },
      { title: "Parser health", url: "/parsing", icon: FileSearchIcon },
    ],
  },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const active = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url))

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                  HS
                </span>
                <span className="text-base font-semibold tracking-tight">HireSense</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Upload résumé"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <Link href="/upload">
                    <UploadIcon />
                    <span>Upload résumé</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={active(item.url)}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-3">
        <SidebarGroupLabel className="h-auto">Preferences</SidebarGroupLabel>
        <ThemeSwitcher />
        <p className="px-2 pb-1 text-xs leading-relaxed text-muted-foreground">
          Case Study 31 · SEPM
          <br />
          Synthetic demo data
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
