"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { MisCosasBreadcrumb } from "@/components/mis-cosas-breadcrumb";
import { MisCosasMobileBreadcrumb } from "@/components/mis-cosas-mobile-breadcrumb";
import { MisCosasSidebar } from "@/components/mis-cosas-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_WIDTH_STYLE = {
  "--sidebar-width": "255px",
} as CSSProperties;

export function MisCosasShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname() ?? "";
  const isMobile = useIsMobile();
  const isHub = pathname === "/mis-cosas";

  if (isMobile) {
    return (
      <TooltipProvider>
        <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col">
          {!isHub ? <MisCosasMobileBreadcrumb /> : null}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {isHub ? (
              children
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-6 px-6 pt-6">
                {children}
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col md:border md:border-sidebar-border">
        <MisCosasBreadcrumb />
        <SidebarProvider
          className="flex min-h-0 min-w-0 flex-1"
          style={SIDEBAR_WIDTH_STYLE}
        >
          <MisCosasSidebar isAdmin={isAdmin} />
          <SidebarInset className="min-h-0 min-w-0 md:max-h-[calc(100svh-7rem-4rem)]">
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pt-6">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}
