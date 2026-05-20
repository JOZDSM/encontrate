"use client";

import { useState } from "react";
import { sendSignalInquiryReply } from "@/app/actions/signals";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SignalInquiryThreadReplyForm({
  signalId,
  peerUserId,
}: {
  signalId: string;
  peerUserId: string;
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
        const res = await sendSignalInquiryReply({
          signalId,
          peerUserId,
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
        <Label htmlFor="signal-inquiry-reply">Tu respuesta</Label>
        <Textarea
          id="signal-inquiry-reply"
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
