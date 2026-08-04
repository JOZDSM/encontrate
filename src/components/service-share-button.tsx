"use client";

import { Share } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ServiceShareButton({
  title,
  text,
}: {
  title: string;
  text: string;
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
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55"
      onClick={onShare}
    >
      <Share className="size-4" aria-hidden />
      {copied ? "Enlace copiado" : "Compartir"}
    </Button>
  );
}
