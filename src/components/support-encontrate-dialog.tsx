"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BMAC_URL } from "@/lib/bmac";

export type SupportReason =
  | "listing_published"
  | "signal_published"
  | "booking_request_sent"
  | "booking_confirmed";

type Copy = { title: string; body: string };

const COPY: Record<SupportReason, Copy> = {
  listing_published: {
    title: "Tu habitación está publicada",
    body: "Si encontrate te resultó útil, ¿nos invitás un café? Nos ayuda a mantener el proyecto.",
  },
  signal_published: {
    title: "Tu señal está activa",
    body: "Ya estás visible para anfitriones que estén buscando huésped. Si encontrate te resultó útil, ¿nos invitás un café?",
  },
  booking_request_sent: {
    title: "Solicitud enviada",
    body: "Si encontrate te ayudó a dar el primer paso, ¿nos invitás un café?",
  },
  booking_confirmed: {
    title: "Reserva confirmada",
    body: "Si encontrate te ayudó a coordinar esta estancia, ¿nos invitás un café?",
  },
};

type Props = {
  open: boolean;
  reason: SupportReason;
  /**
   * Runs after the user dismisses the dialog (whether they tapped the support
   * CTA or "Ahora no"). Wire your follow-up `router.push` / `router.refresh`
   * here so navigation happens regardless of choice.
   */
  onClose: () => void;
};

export function SupportEncontrateDialog({ open, reason, onClose }: Props) {
  const { title, body } = COPY[reason];

  function handleSupport() {
    if (typeof window !== "undefined") {
      window.open(BMAC_URL, "_blank", "noopener,noreferrer");
    }
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Ahora no
          </Button>
          <Button onClick={handleSupport}>Invitanos un café ☕</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
