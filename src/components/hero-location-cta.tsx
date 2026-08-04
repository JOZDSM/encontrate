import Link from "next/link";
import { ExternalLink, Instagram, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared hero CTA surface: foreground fill → brand on hover. */
export const heroCtaClassName =
  "rounded-full border-0 bg-foreground text-background shadow-none transition-colors hover:bg-brand-background hover:text-primary-foreground";

type HeroLocationCtaProps = {
  label: string;
  href: string;
  className?: string;
};

export function HeroLocationCta({ label, href, className }: HeroLocationCtaProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 px-3 text-sm font-medium",
        heroCtaClassName,
        className,
      )}
    >
      <MapPin className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

type HeroWebsiteCtaProps = {
  href: string;
  className?: string;
};

export function HeroWebsiteCta({ href, className }: HeroWebsiteCtaProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 px-3 text-sm font-medium",
        heroCtaClassName,
        className,
      )}
    >
      <span>Sitio web</span>
      <ExternalLink className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
    </Link>
  );
}

type HeroInstagramCtaProps = {
  href: string;
  brandName: string;
  className?: string;
};

export function HeroInstagramCta({
  href,
  brandName,
  className,
}: HeroInstagramCtaProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Instagram de ${brandName}`}
      className={cn(
        "inline-flex size-8 items-center justify-center",
        heroCtaClassName,
        className,
      )}
    >
      <Instagram className="size-4" strokeWidth={2} aria-hidden />
    </Link>
  );
}
