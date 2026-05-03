"use client";

import Link from "next/link";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MisCosasSidebar } from "@/components/mis-cosas-sidebar";

export function MisCosasShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="flex min-h-0 min-w-0 flex-1">
        <MisCosasSidebar isAdmin={isAdmin} />
        <SidebarInset className="min-h-0 min-w-0 overflow-y-auto md:max-h-[calc(100svh-7rem)]">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 md:h-16 md:px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Inicio
            </Link>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
