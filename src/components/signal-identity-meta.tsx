import { SignalInstagramIcon } from "@/components/signal-instagram-icon";
import { canonicalizeCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";

export type SignalIdentityMetaProps = {
  age: number | null;
  countryOfOrigin: string | null;
  instagramHandle: string | null;
  /** When false, Instagram renders as text (no link), e.g. DRAFT on Mis señales. */
  linkInstagram?: boolean;
  className?: string;
};

function MetaSeparator() {
  return (
    <span aria-hidden className="text-muted-foreground">
      |
    </span>
  );
}

/**
 * Second line under the Señal name: age | country | Instagram.
 * Figma auto-layout: horizontal row, gap-2 between every item (including |).
 */
export function SignalIdentityMeta({
  age,
  countryOfOrigin,
  instagramHandle,
  linkInstagram = true,
  className,
}: SignalIdentityMetaProps) {
  const country = countryOfOrigin?.trim() || "";
  const displayCountry = country
    ? canonicalizeCountry(country) ?? country
    : "";
  const ig = instagramHandle?.trim().replace(/^@/, "") || "";

  const items: React.ReactNode[] = [];

  if (age !== null && age !== undefined) {
    items.push(
      <span key="age" className="whitespace-nowrap">
        {age} años
      </span>,
    );
  }

  if (displayCountry) {
    if (items.length > 0) items.push(<MetaSeparator key="sep-country" />);
    items.push(
      <span key="country" className="whitespace-nowrap">
        {displayCountry}
      </span>,
    );
  }

  if (ig) {
    if (items.length > 0) items.push(<MetaSeparator key="sep-ig" />);
    items.push(
      linkInstagram ? (
        <a
          key="ig"
          href={`https://instagram.com/${ig}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-brand-accent hover:underline"
        >
          <SignalInstagramIcon className="size-[13px]" />
          {ig}
        </a>
      ) : (
        <span
          key="ig"
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-brand-accent"
        >
          <SignalInstagramIcon className="size-[13px]" />
          {ig}
        </span>
      ),
    );
  }

  if (items.length === 0) return null;

  return (
    <p
      className={cn(
        "flex min-h-6 flex-wrap items-center gap-2 text-xs leading-snug sm:text-sm",
        className ?? "text-foreground",
      )}
    >
      {items}
    </p>
  );
}
