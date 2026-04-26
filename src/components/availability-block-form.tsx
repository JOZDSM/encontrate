"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAvailabilityBlock } from "@/app/actions/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AvailabilityBlockForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await createAvailabilityBlock({
      listingId,
      startDate,
      endDate,
      reason: null,
    });
    setLoading(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setStartDate("");
    setEndDate("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
      <div className="space-y-1">
        <Label className="text-xs">Cierre desde</Label>
        <Input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Hasta (exclusivo)</Label>
        <Input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          Añadir cierre
        </Button>
        {err ? <span className="text-xs text-destructive">{err}</span> : null}
      </div>
    </form>
  );
}
