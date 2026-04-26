import { BookingStatus } from "@/generated/prisma/enums";

const labels: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  DECLINED: "Rechazada",
  CANCELLED: "Cancelada",
};

export function bookingStatusLabel(s: BookingStatus): string {
  return labels[s] ?? s;
}
