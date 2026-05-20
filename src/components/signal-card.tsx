"use client";

import Link from "next/link";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignalDeleteButton } from "@/components/signal-delete-button";
import { SignalIdentityMeta } from "@/components/signal-identity-meta";
import { SignalStatusControls } from "@/components/signal-status-controls";
import { stripHtmlForSnippet } from "@/lib/listing-description-html";
import { cn } from "@/lib/utils";

export type SignalCardData = {
  id: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  fullName: string;
  age: number | null;
  countryOfOrigin: string | null;
  instagramHandle: string | null;
  description: string | null;
  coverUrl: string | null;
};

/**
 * Card preview used in Mis señales (and reusable elsewhere). Mirrors the
 * `ListingSearchResultCard` family — square thumbnail on desktop, full-width
 * 16:10 on mobile — with a Señal-specific meta line and an action stack on
 * the right (bottom on mobile).
 *
 * Three visual states drive the bottom CTA + emphasis:
 *   - ACTIVE   → "Desactivar esta señal" (outline)
 *   - INACTIVE → "Activar esta señal"    (primary)
 *   - DRAFT    → "Completar publicación" (outline, links into the wizard);
 *                middle block and Ver/Editar buttons render muted to convey
 *                incompleteness.
 */
export function SignalCard({ signal }: { signal: SignalCardData }) {
  const isDraft = signal.status === "DRAFT";
  const title = signal.fullName.trim() || "Señal sin nombre";

  const descriptionSnippet = signal.description
    ? stripHtmlForSnippet(signal.description)
    : "";

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0 ring-foreground/10 md:flex-row md:items-stretch">
      <SignalCardCover url={signal.coverUrl ?? ""} />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-4 px-4 py-4 md:flex-row md:items-stretch md:gap-6 md:px-6",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <h3
            className={cn(
              "m-0 text-sm leading-snug font-semibold sm:text-base",
              isDraft ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {title}
          </h3>

          <SignalIdentityMeta
            age={signal.age}
            countryOfOrigin={signal.countryOfOrigin}
            instagramHandle={signal.instagramHandle}
            linkInstagram={!isDraft}
            className={cn(
              "mt-2 text-xs leading-snug sm:text-sm",
              isDraft ? "text-muted-foreground" : "text-foreground",
            )}
          />

          {descriptionSnippet ? (
            <p
              className={cn(
                "mt-4 line-clamp-3 text-xs leading-snug text-muted-foreground sm:text-sm",
              )}
            >
              {descriptionSnippet}
            </p>
          ) : null}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 md:w-[298px] md:items-stretch md:justify-center">
          <div className="flex items-center gap-2">
            {isDraft ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex-1 text-muted-foreground disabled:opacity-100"
              >
                Ver
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/signals/${signal.id}`}>Ver</Link>
              </Button>
            )}
            {isDraft ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex-1 text-muted-foreground disabled:opacity-100"
              >
                Editar
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/signals/${signal.id}/editar`}>Editar</Link>
              </Button>
            )}
            <SignalDeleteButton signalId={signal.id} className="flex-1" />
          </div>

          {isDraft ? (
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/signals/${signal.id}/editar`}>
                Completar publicación
              </Link>
            </Button>
          ) : (
            <SignalStatusControls
              signalId={signal.id}
              status={signal.status}
              variant="card"
              fullWidth
            />
          )}
        </div>
      </div>
    </Card>
  );
}

function SignalCardCover({ url }: { url: string }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const showImg = url.length > 0 && !loadFailed;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-muted",
        "aspect-[16/10] w-full md:aspect-auto md:h-[168px] md:w-[168px]",
      )}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <ImageIcon className="size-10 opacity-50" aria-hidden />
        </div>
      )}
    </div>
  );
}
