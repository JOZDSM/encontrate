"use client";

import { usePathname } from "next/navigation";
import { MisCosasBreadcrumb } from "@/components/mis-cosas-breadcrumb";
import { MisCosasMobileBreadcrumb } from "@/components/mis-cosas-mobile-breadcrumb";
import { MisCosasSidebar } from "@/components/mis-cosas-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

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
      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col md:border-x md:border-sidebar-border">
        <MisCosasBreadcrumb />
        <div className="flex min-h-0 flex-1">
          <MisCosasSidebar isAdmin={isAdmin} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pt-6">
            {children}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
