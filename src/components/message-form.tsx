"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendListingMessage } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MessageForm({
  listingId,
  bookingId,
}: {
  listingId: string;
  bookingId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await sendListingMessage({ listingId, bookingId, body });
    setLoading(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe un mensaje…"
        rows={3}
        required
      />
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
      <Button type="submit" size="sm" disabled={loading}>
        Enviar
      </Button>
    </form>
  );
}
