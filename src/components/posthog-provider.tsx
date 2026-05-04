"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Session } from "next-auth";

function getPosthogConfig() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return null;

  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://app.posthog.com";

  return { key, host };
}

export function PosthogProvider({
  children,
  session,
  enabled,
}: {
  children: React.ReactNode;
  session: Session | null;
  enabled?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rolesLoadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (enabled === false) return;
    const cfg = getPosthogConfig();
    if (!cfg) return;

    posthog.init(cfg.key, {
      api_host: cfg.host,
      capture_pageview: false, // we capture manually on route changes (App Router)
      capture_pageleave: true,
      autocapture: true,
    });
  }, [enabled]);

  useEffect(() => {
    if (enabled === false) return;
    const cfg = getPosthogConfig();
    if (!cfg) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, enabled]);

  useEffect(() => {
    if (enabled === false) return;
    const cfg = getPosthogConfig();
    if (!cfg) return;

    const userId = session?.user?.id;
    if (!userId) {
      posthog.reset();
      return;
    }

    posthog.identify(userId, {
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      isAdmin: Boolean(session.user.isAdmin),
      isApproved: Boolean(session.user.isApproved),
      internal: Boolean(session.user.isAdmin),
    });
  }, [session, enabled]);

  useEffect(() => {
    if (enabled === false) return;
    const cfg = getPosthogConfig();
    if (!cfg) return;

    const userId = session?.user?.id;
    if (!userId) {
      rolesLoadedFor.current = null;
      return;
    }
    if (rolesLoadedFor.current === userId) return;

    rolesLoadedFor.current = userId;

    (async () => {
      try {
        const res = await fetch("/api/me/analytics", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as
          | { ok: true; roles: Record<string, boolean> }
          | { ok: false };
        if (!json.ok) return;
        posthog.people.set(json.roles);
      } catch {
        // ignore
      }
    })();
  }, [session, enabled]);

  const cfg = getPosthogConfig();
  if (enabled === false || !cfg) return <>{children}</>;

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

