"use client";

import { useCallback, useState } from "react";
import { captureServiceShareClicked } from "@/lib/catalogue-analytics";

export function useServiceShare({
  title,
  text,
  serviceId,
  slug,
  serviceTitle,
  professionalName,
}: {
  title: string;
  text: string;
  serviceId: string;
  slug: string;
  serviceTitle: string;
  professionalName: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    captureServiceShareClicked({
      serviceId,
      slug,
      title: serviceTitle,
      professionalName,
    });

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
  }, [title, text, serviceId, slug, serviceTitle, professionalName]);

  return { share, copied };
}
