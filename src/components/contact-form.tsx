"use client";

import { useMemo, useState } from "react";
import { sendContactMessageAction } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => message.trim().length >= 5, [message]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        const res = await sendContactMessageAction({ message });
        setLoading(false);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setMessage("");
        setSuccess("Mensaje enviado. Te responderemos lo antes posible.");
      }}
    >
      <div className="space-y-4">
        <Label htmlFor="contact-message" className="sr-only">Mensaje</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={12}
          className="min-h-32"
          placeholder="Contanos en qué podemos ayudarte…"
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm font-medium text-foreground" role="status">
          {success}
        </p>
      ) : null}

      <Button
        type="submit"
        size="sm"
        className="w-full rounded-full font-medium shadow-xs disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground"
        disabled={loading || !canSubmit}
      >
        {loading ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}

