"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBookingRequest } from "@/app/actions/bookings";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupportEncontrateDialog } from "@/components/support-encontrate-dialog";

export function BookingRequestForm({
  listingId,
  disabled = false,
}: {
  listingId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    posthog.capture("booking_request_clicked", { listing_id: listingId });
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
      posthog.capture("booking_request_error", { listing_id: listingId });
      return;
    }
    posthog.capture("booking_request_submitted", { listing_id: listingId });
    setSupportOpen(true);
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border bg-card p-4"
      >
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
              disabled={disabled}
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
              disabled={disabled}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {msg ? <p className="text-sm text-destructive">{msg}</p> : null}
        <Button type="submit" disabled={loading || disabled}>
          {loading ? "Enviando…" : "Enviar solicitud"}
        </Button>
      </form>

      <SupportEncontrateDialog
        open={supportOpen}
        reason="booking_request_sent"
        onClose={() => {
          setSupportOpen(false);
          router.push("/mis-cosas/mensajes");
          router.refresh();
        }}
      />
    </>
  );
}
