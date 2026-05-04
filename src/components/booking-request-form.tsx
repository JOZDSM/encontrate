"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBookingRequest } from "@/app/actions/bookings";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BookingRequestForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await createBookingRequest({
      listingId,
      startDate,
      endDate,
    });
    setLoading(false);
    if (!res.ok) {
      setMsg(res.error);
      posthog.capture("booking_request_error");
      return;
    }
    posthog.capture("booking_request_submitted");
    router.push("/mis-cosas/mensajes");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-4">
      <h3 className="font-medium">Solicitar estancia</h3>
      <p className="text-xs text-muted-foreground">
        Las fechas son el primer día de estancia y el día de salida (mañana de
        checkout), como en un calendario tipo hotel.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Entrada</Label>
          <Input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Salida</Label>
          <Input
            id="endDate"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      {msg ? <p className="text-sm text-destructive">{msg}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Enviando…" : "Enviar solicitud"}
      </Button>
    </form>
  );
}
