import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  CalendarRange,
  Fingerprint,
  FlaskConical,
  Grid2X2,
  ImageIcon,
  Languages,
  MapPin,
  Ruler,
  Search,
  Sofa,
  Trash2,
  User as UserIcon,
  Wifi,
} from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignalAuthorContact } from "@/components/signal-author-contact";
import { SignalIdentityMeta } from "@/components/signal-identity-meta";
import { SignalStatusControls } from "@/components/signal-status-controls";
import { isPlatformAdmin } from "@/lib/admin";
import { isUserApproved } from "@/lib/approval";
import { BARCELONA_ZONE_LABELS } from "@/lib/barcelona-zones";
import { isUserProfileComplete } from "@/lib/profile";
import {
  listingDescriptionDisplayHtml,
  stripHtmlForSnippet,
} from "@/lib/listing-description-html";
import {
  formatSignalDatesSummary,
  formatSignalRoomSizePreference,
  joinSignalLabels,
  signalHasDatesData,
} from "@/lib/signal-detail-format";
import {
  SIGNAL_BED_SIZE_LABELS,
  SIGNAL_GENDER_LABELS,
  SIGNAL_LANGUAGE_LABELS,
  SIGNAL_MOVING_WITH_LABELS,
  SIGNAL_OCCUPATION_LABELS,
  SIGNAL_WINDOW_TYPE_LABELS,
} from "@/lib/signal-labels";
import { prisma } from "@/lib/db";

const DESCRIPTION_PROSE =
  "listing-description-html max-w-none text-sm leading-relaxed text-muted-foreground [&_li]:my-0 [&_li]:pl-0 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5";

function CharacteristicRow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
      <p className="text-sm text-foreground">{children}</p>
    </div>
  );
}

function CharacteristicCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  const signal = await prisma.signal.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, whatsappNumber: true },
      },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!signal) notFound();

  const viewerId = session.user.id;
  const isOwner = signal.userId === viewerId;
  const isAdmin = isPlatformAdmin(session);
  if (signal.status === "DRAFT" && !isOwner && !isAdmin) notFound();

  const coverPhoto = signal.photos[0] ?? null;
  const descriptionHtml = signal.description?.trim()
    ? listingDescriptionDisplayHtml(signal.description)
    : null;
  const hasBioSnippet = Boolean(
    signal.description && stripHtmlForSnippet(signal.description).length > 0,
  );

  const datesSummary = formatSignalDatesSummary(signal);
  const showDates = signalHasDatesData(signal);

  const basicsRows: React.ReactNode[] = [];
  if (signal.occupation) {
    basicsRows.push(
      <CharacteristicRow key="occ" icon={UserIcon}>
        {SIGNAL_OCCUPATION_LABELS[signal.occupation] ?? signal.occupation}
      </CharacteristicRow>,
    );
  }
  if (signal.languages.length > 0) {
    basicsRows.push(
      <CharacteristicRow key="lang" icon={Languages}>
        {joinSignalLabels(signal.languages, SIGNAL_LANGUAGE_LABELS)}
      </CharacteristicRow>,
    );
  }
  if (signal.movingWith) {
    basicsRows.push(
      <CharacteristicRow key="moving" icon={Search}>
        Busco: {SIGNAL_MOVING_WITH_LABELS[signal.movingWith] ?? signal.movingWith}
      </CharacteristicRow>,
    );
  }

  const moreRows: React.ReactNode[] = [];
  if (signal.gender) {
    moreRows.push(
      <CharacteristicRow key="gender" icon={Fingerprint}>
        {SIGNAL_GENDER_LABELS[signal.gender] ?? signal.gender}
      </CharacteristicRow>,
    );
  }
  if (signal.cleanlinessImportance !== null) {
    moreRows.push(
      <CharacteristicRow key="clean" icon={FlaskConical}>
        Nivel de limpieza: {signal.cleanlinessImportance}
      </CharacteristicRow>,
    );
  }
  if (signal.orderImportance !== null) {
    moreRows.push(
      <CharacteristicRow key="order" icon={Trash2}>
        Nivel de orden: {signal.orderImportance}
      </CharacteristicRow>,
    );
  }

  const zoneLabels = signal.preferredZones
    .map((z) => BARCELONA_ZONE_LABELS[z] ?? z)
    .join(" · ");

  const prefLeft: React.ReactNode[] = [];
  const prefRight: React.ReactNode[] = [];

  if (signal.preferredZones.length > 0) {
    prefLeft.push(
      <CharacteristicRow key="zones" icon={MapPin}>
        <span className="font-medium">Barrios:</span> {zoneLabels}
      </CharacteristicRow>,
    );
  }
  if (signal.preferredWindowTypes.length > 0) {
    prefLeft.push(
      <CharacteristicRow key="win" icon={Grid2X2}>
        <span className="font-medium">Ventana:</span>{" "}
        {joinSignalLabels(signal.preferredWindowTypes, SIGNAL_WINDOW_TYPE_LABELS)}
      </CharacteristicRow>,
    );
  }
  if (signal.preferredRoomSizeSqmMin !== null) {
    prefLeft.push(
      <CharacteristicRow key="room" icon={Ruler}>
        <span className="font-medium">Tamaño de habitación:</span>{" "}
        {formatSignalRoomSizePreference(signal.preferredRoomSizeSqmMin)}
      </CharacteristicRow>,
    );
  }
  if (signal.preferredBedSizes.length > 0) {
    prefRight.push(
      <CharacteristicRow key="bed" icon={BedDouble}>
        <span className="font-medium">Cama:</span>{" "}
        {joinSignalLabels(signal.preferredBedSizes, SIGNAL_BED_SIZE_LABELS)}
      </CharacteristicRow>,
    );
  }
  if (signal.preferredFurnished !== null) {
    prefRight.push(
      <CharacteristicRow key="furn" icon={Sofa}>
        <span className="font-medium">Habitación amueblada:</span>{" "}
        {signal.preferredFurnished ? "Sí" : "No"}
      </CharacteristicRow>,
    );
  }
  if (signal.preferredWifi !== null) {
    prefRight.push(
      <CharacteristicRow key="wifi" icon={Wifi}>
        <span className="font-medium">WIFI:</span>{" "}
        {signal.preferredWifi ? "Sí" : "No"}
      </CharacteristicRow>,
    );
  }

  const showPrefs = prefLeft.length > 0 || prefRight.length > 0;
  const showCaracteristicas =
    basicsRows.length > 0 ||
    moreRows.length > 0 ||
    showDates ||
    showPrefs;

  const showHeroPanel = coverPhoto !== null || hasBioSnippet;

  return (
    <div className="flex min-h-0 flex-1 flex-col text-foreground">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1440px] flex-1 flex-col px-4 pt-4 pb-8 md:overflow-hidden md:pt-6 md:pb-3">
        <div className="flex min-h-0 flex-1 flex-col gap-6 md:overflow-y-auto md:overscroll-y-contain md:pr-1">
          <header className="flex w-full flex-col gap-1">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              {signal.fullName}
            </h1>
            <SignalIdentityMeta
              age={signal.age}
              countryOfOrigin={signal.countryOfOrigin}
              instagramHandle={signal.instagramHandle}
              linkInstagram={signal.status !== "DRAFT"}
            />
            {isOwner || isAdmin ? (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/signals/${signal.id}/editar`}>Editar señal</Link>
                </Button>
                <SignalStatusControls
                  signalId={signal.id}
                  status={signal.status}
                />
              </div>
            ) : null}
          </header>

          {showHeroPanel ? (
            <section className="w-full rounded-2xl border border-border">
              <div className="flex justify-center px-4 py-6">
                {coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPhoto.url}
                    alt=""
                    className="max-h-[min(70vh,520px)] w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="flex min-h-[200px] w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-10 opacity-50" aria-hidden />
                  </div>
                )}
              </div>
              {hasBioSnippet && descriptionHtml ? (
                <div
                  className={`border-t border-border px-4 py-4 ${DESCRIPTION_PROSE}`}
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : null}
            </section>
          ) : null}

          <Separator className="my-8" />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Información de contacto
            </h2>
            <SignalAuthorContact
              signalId={signal.id}
              previewAsOwner={isOwner}
              guestEmail={signal.user.email}
              guestWhatsappNumber={signal.user.whatsappNumber}
            />
          </section>

          {showCaracteristicas ? (
            <>
              <Separator className="my-8" />
              <section className="flex w-full flex-col gap-6">
                <h2 className="text-lg font-semibold tracking-tight">
                  Características
                </h2>

                {basicsRows.length > 0 || moreRows.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {basicsRows.length > 0 ? (
                      <CharacteristicCard title="Los básicos">
                        {basicsRows}
                      </CharacteristicCard>
                    ) : null}
                    {moreRows.length > 0 ? (
                      <CharacteristicCard title="Más información">
                        {moreRows}
                      </CharacteristicCard>
                    ) : null}
                  </div>
                ) : null}

                {showDates && datesSummary ? (
                  <CharacteristicCard title="Cuándo busca">
                    <CharacteristicRow icon={CalendarRange}>
                      {datesSummary}
                    </CharacteristicRow>
                  </CharacteristicCard>
                ) : null}

                {showPrefs ? (
                  <CharacteristicCard title="Qué busca">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {prefLeft.length > 0 ? (
                        <div className="space-y-3">{prefLeft}</div>
                      ) : null}
                      {prefRight.length > 0 ? (
                        <div className="space-y-3">{prefRight}</div>
                      ) : null}
                    </div>
                  </CharacteristicCard>
                ) : null}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
