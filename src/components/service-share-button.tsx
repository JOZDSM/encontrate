"use client";

import { Share } from "lucide-react";
import { useState } from "react";
import { heroCtaClassName } from "@/components/hero-location-cta";
import { cn } from "@/lib/utils";

export function ServiceShareButton({
  title,
  text,
  className,
}: {
  title: string;
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      // fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 px-3 text-sm font-medium",
        heroCtaClassName,
        className,
      )}
      onClick={onShare}
    >
      <Share className="size-3.5" strokeWidth={2} aria-hidden />
      {copied ? "Enlace copiado" : "Compartir"}
    </button>
  );
}
