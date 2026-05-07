"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmBooking, declineBooking } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { SupportEncontrateDialog } from "@/components/support-encontrate-dialog";

export function HostBookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"c" | "d" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={loading !== null}
          onClick={async () => {
            setLoading("c");
            setErr(null);
            const res = await confirmBooking(bookingId);
            setLoading(null);
            if (!res.ok) setErr(res.error);
            else setSupportOpen(true);
          }}
        >
          {loading === "c" ? "…" : "Confirmar"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading !== null}
          onClick={async () => {
            setLoading("d");
            setErr(null);
            const res = await declineBooking(bookingId);
            setLoading(null);
            if (!res.ok) setErr(res.error);
            else router.refresh();
          }}
        >
          {loading === "d" ? "…" : "Rechazar"}
        </Button>
        {err ? <span className="text-xs text-destructive">{err}</span> : null}
      </div>

      <SupportEncontrateDialog
        open={supportOpen}
        reason="booking_confirmed"
        onClose={() => {
          setSupportOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
