import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizeWhatsappE164(
  raw: string,
): { ok: true; value: string } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Ingresá un número de WhatsApp." };
  }
  const digitsOnly = trimmed.replace(/[^\d+]/g, "");
  const phone = parsePhoneNumberFromString(digitsOnly);
  if (!phone || !phone.isValid()) {
    return {
      ok: false,
      message:
        "Número inválido. Usá formato internacional (E.164), ej: +34600111222.",
    };
  }
  return { ok: true, value: phone.number };
}
