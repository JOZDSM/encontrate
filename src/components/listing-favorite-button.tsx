"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleListingFavorite } from "@/app/actions/favorites";
import { cn } from "@/lib/utils";

export function ListingFavoriteButton({
  listingId,
  initialFavorite,
  canSave,
}: {
  listingId: string;
  initialFavorite: boolean;
  /** When false, click sends the user to login (listings flow). */
  canSave: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorite);
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        disabled={pending}
        aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        aria-pressed={favorited}
        className={cn(
          "rounded-md p-1.5 transition-colors",
          favorited
            ? "text-red-500"
            : "text-muted-foreground hover:text-card-foreground",
        )}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!canSave) {
            const path =
              typeof window !== "undefined"
                ? `${window.location.pathname}${window.location.search}`
                : "/listings";
            window.location.href = `/login?callbackUrl=${encodeURIComponent(path)}`;
            return;
          }
          const was = favorited;
          setErrorMsg(null);
          setFavorited(!was);
          setPending(true);
          try {
            const res = await toggleListingFavorite(listingId);
            if (!res.ok) {
              setFavorited(was);
              setErrorMsg(res.error);
              return;
            }
            setFavorited(res.favorited);
            router.refresh();
          } finally {
            setPending(false);
          }
        }}
      >
        <Heart
          className={cn("size-5", favorited && "fill-red-500 text-red-500")}
          strokeWidth={1.75}
        />
      </button>
      {errorMsg ? (
        <p
          className="max-w-[14rem] text-center text-[10px] leading-tight text-destructive"
          role="alert"
        >
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}
