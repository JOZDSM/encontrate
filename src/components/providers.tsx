"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { isDesignPreviewSession } from "@/lib/design-preview";
import { PosthogProvider } from "@/components/posthog-provider";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const designPreview = isDesignPreviewSession(session);

  return (
    <SessionProvider
      session={session ?? undefined}
      refetchOnWindowFocus={!designPreview}
      refetchInterval={designPreview ? 0 : undefined}
    >
      <PosthogProvider session={session} enabled={!designPreview}>
        <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>
      </PosthogProvider>
    </SessionProvider>
  );
}
