"use client";

import { useRouter } from "next/navigation";
import { cancelBookingAsGuest } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        if (!confirm("¿Cancelar esta reserva?")) return;
        const res = await cancelBookingAsGuest(bookingId);
        if (!res.ok) {
          alert(res.error);
          return;
        }
        router.refresh();
      }}
    >
      Cancelar reserva
    </Button>
  );
}
