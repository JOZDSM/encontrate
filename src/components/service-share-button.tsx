"use client";

import { Share } from "lucide-react";
import { heroCtaClassName } from "@/components/hero-location-cta";
import { useServiceShare } from "@/hooks/use-service-share";
import { cn } from "@/lib/utils";

export function ServiceShareButton({
  title,
  text,
  serviceId,
  slug,
  serviceTitle,
  professionalName,
  className,
}: {
  title: string;
  text: string;
  serviceId: string;
  slug: string;
  serviceTitle: string;
  professionalName: string;
  className?: string;
}) {
  const { share, copied } = useServiceShare({
    title,
    text,
    serviceId,
    slug,
    serviceTitle,
    professionalName,
  });

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 px-3 text-sm font-medium",
        heroCtaClassName,
        className,
      )}
      onClick={() => void share()}
    >
      <Share className="size-3.5" strokeWidth={2} aria-hidden />
      {copied ? "Enlace copiado" : "Compartir"}
    </button>
  );
}
