"use client";

import { useState } from "react";
import { sendInquiryReply } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InquiryThreadReplyForm({
  listingId,
  guestUserId,
}: {
  listingId: string;
  guestUserId: string;
}) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = body.trim().length >= 1;

  return (
    <form
      className="space-y-3 border-t border-border pt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSend || loading) return;
        setLoading(true);
        setError(null);
        const res = await sendInquiryReply({
          listingId,
          guestUserId,
          body: body.trim(),
        });
        setLoading(false);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setBody("");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="inquiry-reply">Tu respuesta</Label>
        <Textarea
          id="inquiry-reply"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribí tu mensaje…"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={!canSend || loading}>
        {loading ? "Enviando…" : "Enviar respuesta"}
      </Button>
    </form>
  );
}
