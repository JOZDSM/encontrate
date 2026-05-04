"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { updateMyProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm({
  defaultName,
  defaultWhatsappNumber,
  afterUrl,
}: {
  defaultName: string;
  defaultWhatsappNumber: string;
  afterUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [whatsappNumber, setWhatsappNumber] = useState(defaultWhatsappNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const phoneState = useMemo(() => {
    const trimmed = whatsappNumber.trim();
    if (!trimmed) return { ok: false, normalized: "" };
    const digitsOnly = trimmed.replace(/[^\d+]/g, "");
    const phone = parsePhoneNumberFromString(digitsOnly);
    const ok = Boolean(phone && phone.isValid());
    return { ok, normalized: phone?.number ?? "" };
  }, [whatsappNumber]);

  const canSubmit = name.trim().length > 0 && phoneState.ok;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit || loading) return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        const res = await updateMyProfileAction({
          name,
          whatsappNumber: phoneState.normalized || whatsappNumber,
        });
        if (!res.ok) {
          setLoading(false);
          setError(res.error);
          return;
        }
        setSuccess("Perfil guardado. Redirigiendo…");
        // Replace is more robust here than push+refresh; it avoids getting stuck on
        // the onboarding route if a refresh races the navigation.
        router.replace(afterUrl);
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="onboarding-name">Nombre de usuario *</Label>
        <Input
          id="onboarding-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="onboarding-whatsapp">Número asociado a WhatsApp *</Label>
        <Input
          id="onboarding-whatsapp"
          type="tel"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="+34600111222"
          required
        />
        <p className="text-xs text-muted-foreground">
          Usá formato internacional (E.164), por ejemplo: +34600111222.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-foreground" role="status">
          {success}
        </p>
      ) : null}

      <Button
        type="submit"
        size="sm"
        className="w-full rounded-full font-medium shadow-xs disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground"
        disabled={loading || !canSubmit}
      >
        {loading ? "Guardando…" : "Continuar"}
      </Button>
    </form>
  );
}

