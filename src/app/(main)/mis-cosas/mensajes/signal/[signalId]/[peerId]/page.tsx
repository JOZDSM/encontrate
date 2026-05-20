import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignalInquiryThreadReplyForm } from "@/components/signal-inquiry-thread-reply-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

function formatMessageTime(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}

export default async function SignalInquiryThreadPage({
  params,
}: {
  params: Promise<{ signalId: string; peerId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { signalId, peerId } = await params;

  const signal = await prisma.signal.findUnique({
    where: { id: signalId },
    select: { id: true, fullName: true, userId: true, status: true },
  });
  if (!signal) notFound();

  // Either side may view: the Señal author, or the peer who started the thread.
  const isAuthor = signal.userId === session.user.id;
  const isPeer = peerId === session.user.id;

  // Confirm a real thread exists between these two users for this Señal so we
  // never expose unrelated conversations through URL guessing.
  const peerStarted = await prisma.message.findFirst({
    where: {
      signalId: signal.id,
      bookingId: null,
      senderId: peerId,
    },
    select: { id: true },
  });

  const authorCanView = isAuthor && !isPeer && peerStarted;
  const peerCanView =
    isPeer &&
    !isAuthor &&
    (await prisma.message.findFirst({
      where: {
        signalId: signal.id,
        bookingId: null,
        senderId: session.user.id,
      },
      select: { id: true },
    }));

  if (!authorCanView && !peerCanView) notFound();

  // Conversation = messages from the two participants only.
  const otherUserId = isAuthor ? peerId : signal.userId;
  const messages = await prisma.message.findMany({
    where: {
      signalId: signal.id,
      bookingId: null,
      senderId: { in: [session.user.id, otherUserId] },
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  const peerLabel = isAuthor
    ? (messages.find((m) => m.senderId === otherUserId)?.sender.name?.trim() ||
        messages.find((m) => m.senderId === otherUserId)?.sender.email?.trim() ||
        "Anfitrión")
    : "Autor de la señal";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/mis-cosas/mensajes"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← Volver a mensajes
        </Link>
        <Badge variant="secondary">Señal</Badge>
      </div>
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-4 p-6 text-card-foreground">
          <div>
            <h1 className="text-xl font-semibold">{signal.fullName}</h1>
            <p className="text-sm text-muted-foreground">
              Conversación con {peerLabel} ·{" "}
              <Link href={`/signals/${signal.id}`} className="underline">
                Ver señal
              </Link>
            </p>
          </div>
          <ul className="space-y-4 border-t border-border pt-4">
            {messages.map((m) => {
              const mine = m.senderId === session.user.id;
              const who =
                mine ? "Vos" : m.sender.name?.trim() || m.sender.email?.trim() || "Usuario";
              return (
                <li
                  key={m.id}
                  className={`rounded-lg border border-border p-3 ${mine ? "bg-muted/30" : "bg-muted/10"}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{who}</span>
                    <time
                      className="text-xs text-muted-foreground"
                      dateTime={m.createdAt.toISOString()}
                    >
                      {formatMessageTime(m.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{m.body}</p>
                </li>
              );
            })}
          </ul>
          <SignalInquiryThreadReplyForm
            signalId={signal.id}
            peerUserId={otherUserId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
