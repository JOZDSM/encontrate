"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutGrid,
  MessageSquare,
  Settings2,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { MisCosasNavHref } from "@/lib/mis-cosas-nav";
import { MIS_COSAS_NAV } from "@/lib/mis-cosas-nav";

const ICONS: Record<MisCosasNavHref, typeof LayoutGrid> = {
  "/mis-cosas/anuncios": LayoutGrid,
  "/mis-cosas/mensajes": MessageSquare,
  "/mis-cosas/favoritos": Heart,
  "/mis-cosas/configuracion": Settings2,
};

export function MisCosasSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname() ?? "";

  return (
    <Sidebar
      collapsible="icon"
      className="[&_[data-slot=sidebar-inner]]:!bg-background md:border-r md:border-sidebar-border"
    >
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MIS_COSAS_NAV.map((item) => {
                const Icon = ICONS[item.href];
                const active = item.match(pathname);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border bg-background">
        <SidebarMenu>
          {isAdmin ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname.startsWith("/admin")}
                tooltip="Administración"
                render={<Link href="/admin" />}
              >
                <Shield className="size-4 shrink-0" />
                <span>Administración</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
