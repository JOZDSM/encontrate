"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBookingAsAdminAction } from "@/app/actions/admin-bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatus } from "@/generated/prisma/enums";
import { bookingStatusLabel } from "@/lib/booking-status-label";

const STATUS_OPTIONS = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.DECLINED,
  BookingStatus.CANCELLED,
] as const;

const STATUS_ITEMS = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s, bookingStatusLabel(s)]),
) as Record<BookingStatus, string>;

export function AdminBookingEditDialog({
  bookingId,
  listingTitle,
  listingCity,
  guestEmail,
  initialStartDate,
  initialEndDate,
  initialStatus,
}: {
  bookingId: string;
  listingTitle: string;
  listingCity: string;
  guestEmail: string | null;
  initialStartDate: string;
  initialEndDate: string;
  initialStatus: BookingStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [status, setStatus] = useState<BookingStatus>(initialStatus);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setStatus(initialStatus);
    setErr(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Editar
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar reserva</DialogTitle>
          <DialogDescription>
            {listingTitle} · {listingCity}
            {guestEmail ? ` · ${guestEmail}` : null}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
            startTransition(async () => {
              const res = await updateBookingAsAdminAction({
                bookingId,
                startDate,
                endDate,
                status,
              });
              if (!res.ok) {
                setErr(res.error);
                return;
              }
              setOpen(false);
              router.refresh();
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${bookingId}-start`}>Entrada</Label>
              <Input
                id={`${bookingId}-start`}
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${bookingId}-end`}>Salida</Label>
              <Input
                id={`${bookingId}-end`}
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${bookingId}-status`}>Estado</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                if (v) setStatus(v as BookingStatus);
              }}
              items={STATUS_ITEMS}
            >
              <SelectTrigger id={`${bookingId}-status`} className="w-full">
                <SelectValue>{bookingStatusLabel(status)}</SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {bookingStatusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {err ? (
            <p className="text-sm text-destructive" role="alert">
              {err}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
