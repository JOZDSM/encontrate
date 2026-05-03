import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { InquiryThreadReplyForm } from "@/components/inquiry-thread-reply-form";
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

export default async function InquiryThreadPage({
  params,
}: {
  params: Promise<{ listingId: string; peerId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { listingId, peerId } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      neighborhood: true,
      hostId: true,
    },
  });
  if (!listing) notFound();

  const guestStarted = await prisma.message.findFirst({
    where: {
      listingId: listing.id,
      bookingId: null,
      senderId: peerId,
    },
    select: { id: true },
  });

  const guestCanView =
    listing.hostId !== session.user.id &&
    peerId === listing.hostId &&
    (await prisma.message.findFirst({
      where: {
        listingId: listing.id,
        bookingId: null,
        senderId: session.user.id,
      },
      select: { id: true },
    }));

  const hostCanView =
    listing.hostId === session.user.id &&
    peerId !== session.user.id &&
    guestStarted;

  if (!guestCanView && !hostCanView) notFound();

  const messages = await prisma.message.findMany({
    where: {
      listingId: listing.id,
      bookingId: null,
      senderId: { in: [session.user.id, peerId] },
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  const isHost = listing.hostId === session.user.id;
  const peerLabel = isHost
    ? (messages.find((m) => m.senderId === peerId)?.sender.name?.trim() ||
        messages.find((m) => m.senderId === peerId)?.sender.email?.trim() ||
        "Huésped")
    : "Anfitrión";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/mis-cosas/mensajes"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← Volver a mensajes
        </Link>
        <Badge variant="secondary">Sin reserva</Badge>
      </div>
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-4 p-6 text-card-foreground">
          <div>
            <h1 className="text-xl font-semibold">{listing.title}</h1>
            <p className="text-sm text-muted-foreground">
              Conversación con {peerLabel} · {listing.neighborhood}
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
          {isHost ? (
            <InquiryThreadReplyForm listingId={listing.id} guestUserId={peerId} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
