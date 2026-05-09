import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Bath,
  BedDouble,
  CalendarRange,
  DoorOpen,
  Globe2,
  Grid2X2,
  Heart,
  Home,
  Languages,
  MapPin,
  Ruler,
  Sofa,
  Sparkles,
  User as UserIcon,
  Wifi,
} from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ListingPhotoGallery } from "@/components/listing-photo-gallery";
import { SignalAuthorContact } from "@/components/signal-author-contact";
import { SignalStatusControls } from "@/components/signal-status-controls";
import { isPlatformAdmin } from "@/lib/admin";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { listingDescriptionDisplayHtml } from "@/lib/listing-description-html";
import { formatDateLongES } from "@/lib/format";
import {
  SIGNAL_BED_SIZE_LABELS,
  SIGNAL_GENDER_LABELS,
  SIGNAL_LANGUAGE_LABELS,
  SIGNAL_MOVING_WITH_LABELS,
  SIGNAL_OCCUPATION_LABELS,
  SIGNAL_FLEX_STAY_LABELS,
  SIGNAL_WINDOW_TYPE_LABELS,
  formatFlexMonth,
} from "@/lib/signal-labels";
import { prisma } from "@/lib/db";

function joinLabels(values: readonly string[], dict: Record<string, string>): string {
  return values.map((v) => dict[v] ?? v).join(" · ");
}

function trueFalseAnyLabel(v: boolean | null): string {
  if (v === null) return "Cualquiera";
  return v ? "Sí" : "No";
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
      user: { select: { id: true, name: true } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!signal) notFound();

  const viewerId = session.user.id;
  const isOwner = signal.userId === viewerId;
  const isAdmin = isPlatformAdmin(session);
  // DRAFTs are private to the owner (and admins for support).
  if (signal.status === "DRAFT" && !isOwner && !isAdmin) notFound();

  const headerChips: { key: string; label: string }[] = [];
  if (signal.countryOfOrigin) {
    headerChips.push({ key: "country", label: signal.countryOfOrigin });
  }
  if (typeof signal.age === "number") {
    headerChips.push({ key: "age", label: `${signal.age} años` });
  }
  if (signal.gender) {
    headerChips.push({
      key: "gender",
      label: SIGNAL_GENDER_LABELS[signal.gender] ?? signal.gender,
    });
  }
  if (signal.movingWith) {
    headerChips.push({
      key: "moving",
      label: SIGNAL_MOVING_WITH_LABELS[signal.movingWith] ?? signal.movingWith,
    });
  }
  if (signal.asapUrgent) {
    headerChips.push({ key: "asap", label: "Urgente" });
  }

  const datesSummary = (() => {
    if (signal.dateMode === "asap") return "Lo antes posible";
    if (signal.dateMode === "exact" && signal.exactCheckIn && signal.exactCheckOut) {
      const flex = signal.exactFlexDays && signal.exactFlexDays > 0
        ? ` (± ${signal.exactFlexDays} días)`
        : "";
      return `${formatDateLongES(signal.exactCheckIn)} → ${formatDateLongES(signal.exactCheckOut)}${flex}`;
    }
    if (signal.dateMode === "flex") {
      const lengths = signal.flexStayLengths.length
        ? joinLabels(signal.flexStayLengths, SIGNAL_FLEX_STAY_LABELS)
        : null;
      const months = signal.flexMonths.length
        ? signal.flexMonths.map(formatFlexMonth).join(", ")
        : null;
      return [lengths, months].filter(Boolean).join(" · ") || "Flexible";
    }
    return "Sin definir";
  })();

  const socialEntries = [
    { key: "instagram", label: "Instagram", value: signal.instagramHandle },
    { key: "twitter", label: "X / Twitter", value: signal.twitterHandle },
    { key: "facebook", label: "Facebook", value: signal.facebookHandle },
    { key: "tiktok", label: "TikTok", value: signal.tiktokHandle },
  ].filter((s): s is typeof s & { value: string } => Boolean(s.value?.trim()));

  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8 pb-12 text-foreground">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Busco habitación</Badge>
            {signal.status !== "ACTIVE" ? (
              <Badge variant="outline" className="capitalize">
                {signal.status === "DRAFT" ? "Borrador" : "Inactiva"}
              </Badge>
            ) : null}
            {headerChips.map((c) => (
              <Badge key={c.key} variant="outline">
                {c.label}
              </Badge>
            ))}
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {signal.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {isOwner || isAdmin ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/signals/${signal.id}/editar`}>Editar señal</Link>
                </Button>
                <SignalStatusControls signalId={signal.id} status={signal.status} />
              </>
            ) : (
              <SignalAuthorContact signalId={signal.id} />
            )}
          </div>
        </header>

        <div className="mt-6">
          {signal.photos.length > 0 ? (
            <ListingPhotoGallery photos={signal.photos} />
          ) : (
            <section className="rounded-2xl border border-dashed border-border bg-muted/15 px-4 py-10 text-center text-sm text-muted-foreground">
              <p>Esta señal todavía no tiene fotos cargadas.</p>
            </section>
          )}
        </div>

        {signal.description ? (
          <>
            <Separator className="my-8" />
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">Sobre mí</h2>
              <div
                className="listing-description-html max-w-none text-sm leading-relaxed text-muted-foreground [&_li]:my-0 [&_li]:pl-0 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{
                  __html: listingDescriptionDisplayHtml(signal.description),
                }}
              />
            </section>
          </>
        ) : null}

        <Separator className="my-8" />

        <section className="space-y-5">
          <h2 className="text-lg font-semibold tracking-tight">Características</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium">Los básicos</p>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                {signal.occupation ? (
                  <div className="flex items-start gap-3">
                    <UserIcon className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      {SIGNAL_OCCUPATION_LABELS[signal.occupation] ?? signal.occupation}
                    </p>
                  </div>
                ) : null}
                {signal.languages.length > 0 ? (
                  <div className="flex items-start gap-3">
                    <Languages className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      {joinLabels(signal.languages, SIGNAL_LANGUAGE_LABELS)}
                    </p>
                  </div>
                ) : null}
                {signal.movingWith ? (
                  <div className="flex items-start gap-3">
                    <Globe2 className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      {SIGNAL_MOVING_WITH_LABELS[signal.movingWith] ?? signal.movingWith}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium">Mi estilo</p>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                {signal.timeUseDescription ? (
                  <p>
                    <span className="text-foreground">Tiempo: </span>
                    {signal.timeUseDescription}
                  </p>
                ) : null}
                {signal.indoorOutdoorDescription ? (
                  <p>
                    <span className="text-foreground">Dentro / fuera: </span>
                    {signal.indoorOutdoorDescription}
                  </p>
                ) : null}
                {signal.cleanlinessImportance !== null ? (
                  <p>
                    <span className="text-foreground">Limpieza: </span>
                    {signal.cleanlinessImportance}/10
                  </p>
                ) : null}
                {signal.orderImportance !== null ? (
                  <p>
                    <span className="text-foreground">Orden: </span>
                    {signal.orderImportance}/10
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-4">
            <p className="text-sm font-medium">¿Cuándo?</p>
            <div className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
              <CalendarRange className="mt-0.5 size-4 text-foreground" aria-hidden />
              <p className="text-foreground">{datesSummary}</p>
            </div>
            {signal.asapUrgent && signal.dateMode !== "asap" ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3" aria-hidden />
                Marcada como búsqueda urgente.
              </p>
            ) : null}
          </div>

          {(signal.preferredZones.length > 0 ||
            signal.preferredBedSizes.length > 0 ||
            signal.preferredWindowTypes.length > 0 ||
            signal.preferredRoomSizeSqmMin !== null ||
            signal.preferredFurnished !== null ||
            signal.preferredApartmentRoomsMin !== null ||
            signal.preferredApartmentBathsMin !== null ||
            signal.preferredApartmentSizeSqmMin !== null ||
            signal.preferredWifi !== null) && (
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium">¿Qué busca?</p>
              <div className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {signal.preferredZones.length > 0 ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      {signal.preferredZones.join(" · ")}
                    </p>
                  </div>
                ) : null}
                {signal.preferredBedSizes.length > 0 ? (
                  <div className="flex items-start gap-3">
                    <BedDouble className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      {joinLabels(signal.preferredBedSizes, SIGNAL_BED_SIZE_LABELS)}
                    </p>
                  </div>
                ) : null}
                {signal.preferredWindowTypes.length > 0 ? (
                  <div className="flex items-start gap-3">
                    <Grid2X2 className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      {joinLabels(
                        signal.preferredWindowTypes,
                        SIGNAL_WINDOW_TYPE_LABELS,
                      )}
                    </p>
                  </div>
                ) : null}
                {signal.preferredRoomSizeSqmMin !== null ? (
                  <div className="flex items-start gap-3">
                    <Ruler className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      ≥ {signal.preferredRoomSizeSqmMin} m² (habitación)
                    </p>
                  </div>
                ) : null}
                {signal.preferredFurnished !== null ? (
                  <div className="flex items-start gap-3">
                    <Sofa className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      Amueblada: {trueFalseAnyLabel(signal.preferredFurnished)}
                    </p>
                  </div>
                ) : null}
                {signal.preferredApartmentRoomsMin !== null ? (
                  <div className="flex items-start gap-3">
                    <DoorOpen className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      ≥ {signal.preferredApartmentRoomsMin} habitaciones
                    </p>
                  </div>
                ) : null}
                {signal.preferredApartmentBathsMin !== null ? (
                  <div className="flex items-start gap-3">
                    <Bath className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      ≥ {signal.preferredApartmentBathsMin} baños
                    </p>
                  </div>
                ) : null}
                {signal.preferredApartmentSizeSqmMin !== null ? (
                  <div className="flex items-start gap-3">
                    <Home className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      ≥ {signal.preferredApartmentSizeSqmMin} m² (piso)
                    </p>
                  </div>
                ) : null}
                {signal.preferredWifi !== null ? (
                  <div className="flex items-start gap-3">
                    <Wifi className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      Wifi: {trueFalseAnyLabel(signal.preferredWifi)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {socialEntries.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium">Redes</p>
              <div className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {socialEntries.map((s) => (
                  <div key={s.key} className="flex items-start gap-3">
                    <Heart className="mt-0.5 size-4 text-foreground" aria-hidden />
                    <p className="text-foreground">
                      <span className="text-muted-foreground">{s.label}: </span>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
