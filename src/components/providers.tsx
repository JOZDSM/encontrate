"use client";

import type { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { isDesignPreviewSession } from "@/lib/design-preview";
import { PosthogProvider } from "@/components/posthog-provider";
import { isServicesCatalogSurface } from "@/lib/service-slug";
import { cn } from "@/lib/utils";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const designPreview = isDesignPreviewSession(session);
  const catalogSurface = isServicesCatalogSurface(usePathname());

  return (
    <SessionProvider
      session={session ?? undefined}
      refetchOnWindowFocus={!designPreview}
      refetchInterval={designPreview ? 0 : undefined}
    >
      <PosthogProvider session={session} enabled={!designPreview}>
        <div
          data-app-root
          className={cn(
            "flex flex-col",
            catalogSurface ? "min-h-svh" : "h-full min-h-0 flex-1",
          )}
        >
          {children}
        </div>
      </PosthogProvider>
    </SessionProvider>
  );
}
