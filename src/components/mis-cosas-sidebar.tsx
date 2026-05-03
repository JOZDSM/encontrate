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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const nav = [
  {
    href: "/mis-cosas/anuncios",
    label: "Mis anuncios",
    icon: LayoutGrid,
    match: (p: string) =>
      p === "/mis-cosas/anuncios" || p.startsWith("/mis-cosas/anuncios/"),
  },
  {
    href: "/mis-cosas/mensajes",
    label: "Mensajes",
    icon: MessageSquare,
    match: (p: string) => p.startsWith("/mis-cosas/mensajes"),
  },
  {
    href: "/mis-cosas/favoritos",
    label: "Mis favoritos",
    icon: Heart,
    match: (p: string) => p === "/mis-cosas/favoritos",
  },
  {
    href: "/mis-cosas/configuracion",
    label: "Configuración",
    icon: Settings2,
    match: (p: string) => p.startsWith("/mis-cosas/configuracion"),
  },
] as const;

export function MisCosasSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname() ?? "";

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/mis-cosas/mensajes" />}
            >
              <span className="truncate font-semibold">Mis cosas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const Icon = item.icon;
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
      <SidebarFooter className="border-t border-sidebar-border">
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
