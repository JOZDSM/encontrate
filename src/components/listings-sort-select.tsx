"use client";

import { ArrowDownUp } from "lucide-react";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PublicListingSort } from "@/lib/listing-queries";

const OPTIONS = [
  { value: "recent" as const, label: "Fecha de publicación (más recientes)" },
  { value: "neighborhood" as const, label: "Barrio (A-Z)" },
  { value: "title" as const, label: "Título (A-Z)" },
];

const LABELS: Record<PublicListingSort, string> = {
  recent: "Fecha de publicación (más recientes)",
  neighborhood: "Barrio (A-Z)",
  title: "Título (A-Z)",
};

export function ListingsSortSelect({
  defaultSort,
}: {
  defaultSort: PublicListingSort;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onValueChange = useCallback(
    (newValue: string | null) => {
      if (!newValue) return;
      const next = new URLSearchParams(searchParams.toString());
      next.set("sort", newValue);
      router.push(`/listings?${next.toString()}`);
    },
    [router, searchParams],
  );

  const items = Object.fromEntries(
    OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<PublicListingSort, string>;

  return (
    <div className="flex flex-col gap-2">
      <ArrowDownUp
        className="size-6 shrink-0 text-card-foreground"
        aria-hidden
      />
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="listings-sort"
          className="text-sm font-semibold text-card-foreground"
        >
          Ordenar por:
        </Label>
        <Select
          value={defaultSort}
          onValueChange={onValueChange}
          items={items}
        >
          <SelectTrigger
            id="listings-sort"
            size="default"
            className="text-muted-foreground h-auto min-h-10 w-full max-w-full py-2 whitespace-normal sm:max-w-md [&_[data-slot=select-value]]:whitespace-normal"
          >
            <SelectValue>{LABELS[defaultSort]}</SelectValue>
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
