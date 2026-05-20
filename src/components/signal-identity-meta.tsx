import { SignalInstagramIcon } from "@/components/signal-instagram-icon";
import { canonicalizeCountry } from "@/lib/countries";

export type SignalIdentityMetaProps = {
  age: number | null;
  countryOfOrigin: string | null;
  instagramHandle: string | null;
  /** When false, Instagram renders as text (no link), e.g. DRAFT on Mis señales. */
  linkInstagram?: boolean;
  className?: string;
};

/**
 * Second line under the Señal name: age | country | Instagram.
 * Shared by Mis señales cards and the public detail page.
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

  const segments: React.ReactNode[] = [];
  if (age !== null && age !== undefined) {
    segments.push(
      <span key="age" className="whitespace-nowrap">
        {age} años
      </span>,
    );
  }
  if (displayCountry) {
    segments.push(
      <span key="country" className="whitespace-nowrap">
        {displayCountry}
      </span>,
    );
  }
  if (ig) {
    segments.push(
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

  if (segments.length === 0) return null;

  return (
    <p
      className={
        className ??
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-snug text-foreground sm:text-sm"
      }
    >
      {segments.map((segment, idx) => (
        <span key={idx} className="inline-flex items-center gap-x-2">
          {idx > 0 ? (
            <span aria-hidden className="text-muted-foreground">
              |
            </span>
          ) : null}
          {segment}
        </span>
      ))}
    </p>
  );
}
