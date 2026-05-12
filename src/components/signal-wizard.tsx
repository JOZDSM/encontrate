"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bath,
  Bold,
  Check,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Globe2,
  Home,
  ImagePlus,
  Italic,
  List,
  MoreHorizontal,
  RefreshCcw,
  Ruler,
  Sofa,
  Trash2,
  Upload,
  Wifi,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { BarcelonaZonePicker } from "@/components/barcelona-zone-picker";
import { SignalSteppedMeter } from "@/components/signal-stepped-meter";
import { SupportEncontrateDialog } from "@/components/support-encontrate-dialog";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { stripHtmlForSnippet } from "@/lib/listing-description-html";
import {
  LISTING_PHOTO_TOO_LARGE_MESSAGE,
} from "@/lib/listing-photo-upload";
import { compressListingPhotoIfNeeded } from "@/lib/listing-photo-compress";
import { cn } from "@/lib/utils";
import {
  publishSignal,
  updateSignalStep,
  type UpdateSignalStepInput,
} from "@/app/actions/signals";
import { normalizeSignalWizardResumeStep } from "@/lib/signal-wizard-resume";

const TOTAL_STEPS = 10;

const GENDER_OPTIONS = [
  { value: "MALE", label: "Hombre" },
  { value: "FEMALE", label: "Mujer" },
  { value: "OTHER", label: "Otro" },
] as const;

const OCCUPATION_OPTIONS = [
  { value: "STUDENT", label: "Estudiante" },
  { value: "EMPLOYED", label: "Empleade en relación de dependencia" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "ENTREPRENEUR", label: "Emprendedor/a" },
  { value: "REMOTE_WORKER", label: "Remote worker" },
  { value: "OTHER", label: "Otro" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "ES", label: "Español" },
  { value: "EN", label: "English" },
  { value: "CA", label: "Català" },
  { value: "IT", label: "Italiano" },
  { value: "FR", label: "Français" },
  { value: "DE", label: "Deutsch" },
  { value: "PT", label: "Português" },
  { value: "OTHER", label: "Otro" },
] as const;

const MOVING_WITH_OPTIONS = [
  { value: "SOLO", label: "Solo/a" },
  { value: "COUPLE", label: "Con mi pareja" },
  { value: "FAMILY", label: "Con mi familia" },
  { value: "ROOMMATES", label: "Con compañeres" },
] as const;

const FLEX_STAY_OPTIONS = [
  { value: "WEEKEND", label: "Fin de semana" },
  { value: "WEEK", label: "Semana" },
  { value: "MONTH", label: "Mes" },
] as const;

const FLEX_DAYS_OPTIONS = [
  { value: 0, label: "Fechas exactas" },
  { value: 1, label: "± 1 día" },
  { value: 2, label: "± 2 días" },
  { value: 3, label: "± 3 días" },
  { value: 7, label: "± 7 días" },
  { value: 14, label: "± 14 días" },
];

const BED_SIZE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual",
  DOBLE: "Doble",
};

const WINDOW_TYPE_LABELS: Record<string, string> = {
  CALLE: "A la calle",
  CORAZON_DE_MANZANA: "Corazón de manzana",
  POZO_DE_AIRE: "Pozo de aire",
  SIN_VENTANA: "Sin ventana",
};

const APARTMENT_SIZE_STEPS = Array.from({ length: 25 }, (_, i) => (i + 4) * 10);

type UploadedPhoto = { id: string; url: string };

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function WizardNotificationRow({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] border p-3 text-sm leading-snug transition-colors",
        checked ? "border-border bg-muted" : "border-primary bg-accent",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <span>{label}</span>
    </label>
  );
}

function looksLikeImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp)$/i.test(file.name);
}

function buildMonthOptions(count = 14): { ym: string; label: string }[] {
  const out: { ym: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
    out.push({ ym, label });
  }
  return out;
}

export type SignalWizardInitialState = {
  fullName: string;
  age: number | null;
  gender: string | null;
  countryOfOrigin: string | null;
  occupation: string | null;
  languages: readonly string[];
  movingWith: string | null;
  timeUseDescription: string | null;
  indoorOutdoorDescription: string | null;
  cleanlinessImportance: number | null;
  orderImportance: number | null;
  instagramHandle: string | null;
  twitterHandle: string | null;
  facebookHandle: string | null;
  tiktokHandle: string | null;
  dateMode: string | null;
  exactCheckIn: string | null;
  exactCheckOut: string | null;
  exactFlexDays: number | null;
  flexStayLengths: readonly string[];
  flexMonths: readonly string[];
  asapUrgent: boolean;
  preferredZones: readonly string[];
  preferredBedSizes: readonly string[];
  preferredWindowTypes: readonly string[];
  preferredRoomSizeSqmMin: number | null;
  preferredFurnished: boolean | null;
  preferredApartmentRoomsMin: number | null;
  preferredApartmentBathsMin: number | null;
  preferredApartmentSizeSqmMin: number | null;
  preferredWifi: boolean | null;
  description: string | null;
  listingAlertInApp: boolean;
  listingAlertEmail: boolean;
  photos: readonly { id: string; url: string; sortOrder: number }[];
  /** DB wizard resume version (1 = legacy 8-step UI). */
  wizardFlowVersion: number;
};

export type SignalWizardProps = {
  signalId: string;
  initialState: SignalWizardInitialState;
  /** DB resume cursor; pass through `normalizeSignalWizardResumeStep` from the server. */
  startStep: number;
};

function SortablePhoto({
  photo,
  variant,
  index,
  total,
  onDelete,
  onReplace,
  onMoveEarlier,
  onMoveLater,
}: {
  photo: UploadedPhoto;
  variant: "hero" | "tile";
  index: number;
  total: number;
  onDelete: () => void;
  onReplace: (file: File) => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  const stopMenuDrag = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-muted/20",
        variant === "hero"
          ? "w-full min-h-[220px] sm:min-h-[280px]"
          : "min-h-0 w-full",
      )}
    >
      <div
        className={cn(
          "relative w-full cursor-grab select-none active:cursor-grabbing",
          variant === "hero" ? "aspect-[16/10] sm:aspect-[2/1]" : "aspect-square",
        )}
        {...attributes}
        {...listeners}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt=""
          className="pointer-events-none h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <div
        className="absolute top-2 right-2 z-10"
        onPointerDown={stopMenuDrag}
        onMouseDown={stopMenuDrag}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
              aria-label="Opciones de foto"
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = () => {
                  const f = input.files?.[0];
                  if (f) onReplace(f);
                };
                input.click();
              }}
            >
              <RefreshCcw className="mr-2 size-4" aria-hidden />
              Reemplazar
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index >= total - 1}
              onSelect={(e) => {
                e.preventDefault();
                onMoveLater();
              }}
            >
              <ChevronDown className="mr-2 size-4" aria-hidden />
              Un lugar hacia adelante
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index <= 0}
              onSelect={(e) => {
                e.preventDefault();
                onMoveEarlier();
              }}
            >
              <ChevronUp className="mr-2 size-4" aria-hidden />
              Un lugar hacia atrás
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 size-4" aria-hidden />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function SignalWizard({
  signalId,
  initialState,
  startStep,
}: SignalWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(
      Math.max(
        0,
        normalizeSignalWizardResumeStep(
          startStep,
          initialState.wizardFlowVersion ?? 2,
        ),
      ),
      TOTAL_STEPS - 1,
    ),
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [savingNext, setSavingNext] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  // Step 1 — Introducite
  const [fullName, setFullName] = useState(initialState.fullName ?? "");
  const [age, setAge] = useState<string>(
    initialState.age !== null && initialState.age !== undefined
      ? String(initialState.age)
      : "18",
  );
  const [gender, setGender] = useState<string>(initialState.gender ?? "");
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>(
    initialState.countryOfOrigin ?? "",
  );

  // Step 2 — Dejate ver
  const [photos, setPhotos] = useState<UploadedPhoto[]>(() =>
    initialState.photos.map((p) => ({ id: p.id, url: p.url })),
  );
  const [photoUploadingCount, setPhotoUploadingCount] = useState(0);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  // Step 3 — Los básicos
  const [occupation, setOccupation] = useState<string>(initialState.occupation ?? "");
  const [languages, setLanguages] = useState<string[]>([
    ...initialState.languages,
  ]);
  const [movingWith, setMovingWith] = useState<string>(initialState.movingWith ?? "");

  // Step 4 — Un poco más sobre vos
  const [timeUseDescription, setTimeUseDescription] = useState(
    initialState.timeUseDescription ?? "",
  );
  const [indoorOutdoorDescription, setIndoorOutdoorDescription] = useState(
    initialState.indoorOutdoorDescription ?? "",
  );
  const [cleanlinessImportance, setCleanlinessImportance] = useState<number | null>(
    initialState.cleanlinessImportance,
  );
  const [orderImportance, setOrderImportance] = useState<number | null>(
    initialState.orderImportance,
  );

  // Step 5 — Esto es real?
  const [instagramHandle, setInstagramHandle] = useState(
    initialState.instagramHandle ?? "",
  );
  const [twitterHandle, setTwitterHandle] = useState(initialState.twitterHandle ?? "");
  const [facebookHandle, setFacebookHandle] = useState(
    initialState.facebookHandle ?? "",
  );
  const [tiktokHandle, setTiktokHandle] = useState(initialState.tiktokHandle ?? "");

  // Step 6 — Cuándo
  const [dateMode, setDateMode] = useState<string>(initialState.dateMode ?? "exact");
  const [exactCheckIn, setExactCheckIn] = useState<string>(
    initialState.exactCheckIn ?? "",
  );
  const [exactCheckOut, setExactCheckOut] = useState<string>(
    initialState.exactCheckOut ?? "",
  );
  const [exactFlexDays, setExactFlexDays] = useState<number>(
    initialState.exactFlexDays ?? 0,
  );
  const [flexStayLengths, setFlexStayLengths] = useState<string[]>([
    ...initialState.flexStayLengths,
  ]);
  const [flexMonths, setFlexMonths] = useState<string[]>([...initialState.flexMonths]);
  const monthOptions = useMemo(() => buildMonthOptions(14), []);

  // Step 7 — Qué buscás
  const [preferredZones, setPreferredZones] = useState<string[]>([
    ...initialState.preferredZones,
  ]);
  const [preferredBedSizes, setPreferredBedSizes] = useState<string[]>([
    ...initialState.preferredBedSizes,
  ]);
  const [preferredWindowTypes, setPreferredWindowTypes] = useState<string[]>([
    ...initialState.preferredWindowTypes,
  ]);
  const [preferredRoomSizeSqmMin, setPreferredRoomSizeSqmMin] = useState<string>(
    initialState.preferredRoomSizeSqmMin !== null
      ? String(initialState.preferredRoomSizeSqmMin)
      : "",
  );
  const [preferredFurnished, setPreferredFurnished] = useState<string>(
    initialState.preferredFurnished === true
      ? "si"
      : initialState.preferredFurnished === false
        ? "no"
        : "any",
  );
  const [preferredApartmentRoomsMin, setPreferredApartmentRoomsMin] = useState<string>(
    initialState.preferredApartmentRoomsMin !== null
      ? String(initialState.preferredApartmentRoomsMin)
      : "",
  );
  const [preferredApartmentBathsMin, setPreferredApartmentBathsMin] = useState<string>(
    initialState.preferredApartmentBathsMin !== null
      ? String(initialState.preferredApartmentBathsMin)
      : "",
  );
  const [preferredApartmentSizeSqmMin, setPreferredApartmentSizeSqmMin] = useState<string>(
    initialState.preferredApartmentSizeSqmMin !== null
      ? String(initialState.preferredApartmentSizeSqmMin)
      : "",
  );
  const [preferredWifi, setPreferredWifi] = useState<string>(
    initialState.preferredWifi === true
      ? "si"
      : initialState.preferredWifi === false
        ? "no"
        : "any",
  );

  const [listingAlertInApp, setListingAlertInApp] = useState(
    initialState.listingAlertInApp,
  );
  const [listingAlertEmail, setListingAlertEmail] = useState(
    initialState.listingAlertEmail,
  );

  // Step 8 — Presentate (TipTap)
  const [descriptionHtml, setDescriptionHtml] = useState(initialState.description ?? "");
  const [descriptionText, setDescriptionText] = useState(() =>
    stripHtmlForSnippet(initialState.description ?? ""),
  );
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder:
          "Ej. Qué tal? Soy un estudiante de medicina aquí en Barcelona por un semestre. Estoy buscando una habitación en un piso con gente buena onda, joven, con ganas de hacer planes.",
      }),
    ],
    content: initialState.description ?? "",
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none text-sm leading-5 text-foreground [&_p]:m-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1",
      },
    },
    onUpdate: ({ editor }) => {
      setDescriptionHtml(editor.getHTML());
      setDescriptionText(editor.getText());
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const els = document.querySelectorAll<HTMLElement>("[data-wizard-scroll]");
    els.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [stepIndex]);

  const canGoNext = useMemo(() => {
    if (stepIndex === 0) {
      const t = fullName.trim();
      return t.length >= 3 && t.length <= 120;
    }
    if (stepIndex === 1) return photoUploadingCount === 0;
    if (stepIndex === 2) return Boolean(occupation && movingWith && languages.length > 0);
    if (stepIndex === 3) return true;
    if (stepIndex === 4) return true;
    if (stepIndex === 5) {
      if (dateMode === "asap") return true;
      if (dateMode === "exact") return Boolean(exactCheckIn && exactCheckOut);
      if (dateMode === "flex") return flexStayLengths.length > 0 || flexMonths.length > 0;
      return false;
    }
    if (stepIndex === 6) return true;
    if (stepIndex === 7) return true;
    if (stepIndex === 8) {
      const len = descriptionText.trim().length;
      return len >= 10 && len <= 8000;
    }
    if (stepIndex === 9) return true;
    return true;
  }, [
    stepIndex,
    fullName,
    photoUploadingCount,
    occupation,
    movingWith,
    languages,
    dateMode,
    exactCheckIn,
    exactCheckOut,
    flexStayLengths,
    flexMonths,
    descriptionText,
  ]);

  // "Step complete" is a *visual* gate separate from `canGoNext` (which actually
  // blocks progression): the Siguiente button flips to primary once every field
  // on the step has user input — even on optional steps where skipping is still
  // allowed.
  const isStepComplete = useMemo(() => {
    if (stepIndex === 0) {
      const t = fullName.trim();
      return (
        t.length >= 3 &&
        t.length <= 120 &&
        age.trim() !== "" &&
        !Number.isNaN(Number(age)) &&
        Boolean(gender) &&
        Boolean(countryOfOrigin)
      );
    }
    if (stepIndex === 1) return photoUploadingCount === 0 && photos.length > 0;
    if (stepIndex === 2)
      return Boolean(occupation && movingWith && languages.length > 0);
    if (stepIndex === 3) {
      return (
        timeUseDescription.trim().length > 0 ||
        indoorOutdoorDescription.trim().length > 0 ||
        cleanlinessImportance !== null ||
        orderImportance !== null
      );
    }
    if (stepIndex === 4) {
      return Boolean(
        instagramHandle.trim() ||
          twitterHandle.trim() ||
          facebookHandle.trim() ||
          tiktokHandle.trim(),
      );
    }
    if (stepIndex === 5) {
      if (dateMode === "asap") return true;
      if (dateMode === "exact") return Boolean(exactCheckIn && exactCheckOut);
      if (dateMode === "flex")
        return flexStayLengths.length > 0 || flexMonths.length > 0;
      return false;
    }
    if (stepIndex === 6) return preferredZones.length > 0;
    if (stepIndex === 7) {
      return (
        preferredBedSizes.length > 0 ||
        preferredWindowTypes.length > 0 ||
        preferredRoomSizeSqmMin !== "" ||
        preferredFurnished !== "any" ||
        preferredApartmentRoomsMin !== "" ||
        preferredApartmentBathsMin !== "" ||
        preferredApartmentSizeSqmMin !== "" ||
        preferredWifi !== "any"
      );
    }
    if (stepIndex === 8) {
      const len = descriptionText.trim().length;
      return len >= 10 && len <= 8000;
    }
    return true;
  }, [
    stepIndex,
    fullName,
    age,
    gender,
    countryOfOrigin,
    photoUploadingCount,
    photos,
    occupation,
    movingWith,
    languages,
    timeUseDescription,
    indoorOutdoorDescription,
    cleanlinessImportance,
    orderImportance,
    instagramHandle,
    twitterHandle,
    facebookHandle,
    tiktokHandle,
    dateMode,
    exactCheckIn,
    exactCheckOut,
    flexStayLengths,
    flexMonths,
    preferredZones,
    preferredBedSizes,
    preferredWindowTypes,
    preferredRoomSizeSqmMin,
    preferredFurnished,
    preferredApartmentRoomsMin,
    preferredApartmentBathsMin,
    preferredApartmentSizeSqmMin,
    preferredWifi,
    descriptionText,
  ]);

  const progressValue = Math.min(1, Math.max(0, (stepIndex + 1) / TOTAL_STEPS));
  const isLastStep = stepIndex === TOTAL_STEPS - 1;

  const primaryFooterLabel = useMemo(() => {
    if (stepIndex === 9) return savingNext ? "Publicando…" : "Publicar señal";
    if ([3, 4, 6].includes(stepIndex)) {
      return savingNext ? "Guardando…" : "Saltear / Seguir";
    }
    return savingNext ? "Guardando…" : "Siguiente";
  }, [stepIndex, savingNext]);

  async function uploadOne(file: File): Promise<string> {
    const next = await compressListingPhotoIfNeeded(file);
    const fd = new FormData();
    fd.set("file", next);
    const res = await fetch("/api/uploads/photos", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    let body: { error?: string; url?: string } | null = null;
    try {
      body = (await res.json()) as { error?: string; url?: string };
    } catch {
      body = null;
    }
    if (!res.ok) {
      let message = body?.error ?? "No se pudo subir la imagen.";
      if (!body?.error) {
        if (res.status === 401) message = "Tenés que iniciar sesión.";
        else if (res.status === 403)
          message = "Tu cuenta está pendiente de aprobación.";
        else if (res.status === 413) message = LISTING_PHOTO_TOO_LARGE_MESSAGE;
      }
      throw new Error(message);
    }
    if (!body?.url) throw new Error("No se pudo subir la imagen.");
    return body.url;
  }

  async function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setPhotoUploadError(null);
    // Señales only allow a single profile photo. Take the first valid image
    // and ignore any extras the user may have selected.
    const remaining = Math.max(0, 1 - photos.length);
    const picked = arr.slice(0, remaining).filter(looksLikeImageFile);
    if (picked.length === 0) {
      setPhotoUploadError(
        "No encontramos imágenes válidas (JPEG, PNG, WebP, GIF…).",
      );
      return;
    }

    setPhotoUploadingCount((n) => n + picked.length);
    try {
      const urls = await Promise.all(picked.map((f) => uploadOne(f)));
      setPhotos((prev) => [...prev, ...urls.map((url) => ({ id: makeId(), url }))]);
    } catch (e) {
      setPhotoUploadError(
        e instanceof Error ? e.message : "No se pudo subir la imagen.",
      );
    } finally {
      setPhotoUploadingCount((n) => Math.max(0, n - picked.length));
    }
  }

  async function replacePhoto(photoId: string, file: File) {
    if (!looksLikeImageFile(file)) {
      setPhotoUploadError(
        "Elegí un archivo de imagen (JPEG, PNG, WebP, GIF…).",
      );
      return;
    }
    setPhotoUploadError(null);
    setPhotoUploadingCount((n) => n + 1);
    try {
      const url = await uploadOne(file);
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, url } : p)));
    } catch (e) {
      setPhotoUploadError(
        e instanceof Error ? e.message : "No se pudo subir la imagen.",
      );
    } finally {
      setPhotoUploadingCount((n) => Math.max(0, n - 1));
    }
  }

  function movePhotoInList(photoId: string, direction: "earlier" | "later") {
    setPhotos((prev) => {
      const i = prev.findIndex((p) => p.id === photoId);
      if (i === -1) return prev;
      if (direction === "earlier" && i === 0) return prev;
      if (direction === "later" && i === prev.length - 1) return prev;
      const j = direction === "earlier" ? i - 1 : i + 1;
      return arrayMove(prev, i, j);
    });
  }

  function removePhoto(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  function toggleArrayValue<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  /** Builds the persistence payload for the step the user is currently on. */
  function buildStepPayload(): UpdateSignalStepInput {
    if (stepIndex === 0) {
      return {
        step: "identity",
        fullName: fullName.trim(),
        age: age.trim() === "" || Number.isNaN(Number(age)) ? null : Number(age),
        gender: (gender || null) as never,
        countryOfOrigin: countryOfOrigin.trim() === "" ? null : countryOfOrigin,
      };
    }
    if (stepIndex === 1) {
      return { step: "photos", photoUrls: photos.map((p) => p.url) };
    }
    if (stepIndex === 2) {
      return {
        step: "basics",
        occupation: (occupation || null) as never,
        languages: languages as never,
        movingWith: (movingWith || null) as never,
      };
    }
    if (stepIndex === 3) {
      return {
        step: "more",
        timeUseDescription: timeUseDescription.trim() || null,
        indoorOutdoorDescription: indoorOutdoorDescription.trim() || null,
        cleanlinessImportance,
        orderImportance,
      };
    }
    if (stepIndex === 4) {
      return {
        step: "social",
        instagramHandle: instagramHandle.trim() || null,
        twitterHandle: twitterHandle.trim() || null,
        facebookHandle: facebookHandle.trim() || null,
        tiktokHandle: tiktokHandle.trim() || null,
      };
    }
    if (stepIndex === 5) {
      return {
        step: "dates",
        dateMode: (dateMode || null) as never,
        exactCheckIn: dateMode === "exact" && exactCheckIn ? exactCheckIn : null,
        exactCheckOut: dateMode === "exact" && exactCheckOut ? exactCheckOut : null,
        exactFlexDays: dateMode === "exact" ? exactFlexDays : null,
        flexStayLengths: dateMode === "flex" ? (flexStayLengths as never) : ([] as never),
        flexMonths: dateMode === "flex" ? flexMonths : [],
        asapUrgent: dateMode === "asap",
      };
    }
    if (stepIndex === 6) {
      return { step: "preferencesLocation", preferredZones };
    }
    if (stepIndex === 7) {
      return {
        step: "preferencesRoom",
        preferredBedSizes: preferredBedSizes as never,
        preferredWindowTypes: preferredWindowTypes as never,
        preferredRoomSizeSqmMin:
          preferredRoomSizeSqmMin === "" ? null : Number(preferredRoomSizeSqmMin),
        preferredFurnished:
          preferredFurnished === "any" ? null : preferredFurnished === "si",
        preferredApartmentRoomsMin:
          preferredApartmentRoomsMin === ""
            ? null
            : Number(preferredApartmentRoomsMin),
        preferredApartmentBathsMin:
          preferredApartmentBathsMin === ""
            ? null
            : Number(preferredApartmentBathsMin),
        preferredApartmentSizeSqmMin:
          preferredApartmentSizeSqmMin === ""
            ? null
            : Number(preferredApartmentSizeSqmMin),
        preferredWifi:
          preferredWifi === "any" ? null : preferredWifi === "si",
      };
    }
    if (stepIndex === 8) {
      return {
        step: "description",
        description: (editor?.getHTML() ?? descriptionHtml).trim(),
      };
    }
    return {
      step: "notifications",
      listingAlertInApp,
      listingAlertEmail,
    };
  }

  async function persistCurrentStep(): Promise<boolean> {
    const payload = buildStepPayload();
    const res = await updateSignalStep(signalId, payload);
    if (!res.ok) {
      setSubmitError(res.error);
      return false;
    }
    return true;
  }

  async function handleNext() {
    if (!canGoNext || savingNext) return;
    setSubmitError(null);
    setSavingNext(true);
    try {
      const ok = await persistCurrentStep();
      if (ok) {
        setStepIndex((s) => Math.min(TOTAL_STEPS - 1, s + 1));
      }
    } finally {
      setSavingNext(false);
    }
  }

  async function handlePublish() {
    if (!canGoNext || savingNext) return;
    setSubmitError(null);
    setSavingNext(true);
    try {
      const saved = await persistCurrentStep();
      if (!saved) return;
      const res = await publishSignal(signalId);
      if (!res.ok) {
        setSubmitError(res.error);
        return;
      }
      setPublishedId(res.id);
    } finally {
      setSavingNext(false);
    }
  }

  async function handleBack() {
    if (stepIndex === 0) {
      setCancelDialogOpen(true);
      return;
    }
    // Best-effort autosave on Back too — keep the field state durable so
    // resuming the wizard later doesn't lose work-in-progress.
    setSubmitError(null);
    void persistCurrentStep();
    setStepIndex((s) => Math.max(0, s - 1));
  }

  return (
    <div className="no-ios-zoom mx-auto flex h-full min-h-0 w-full max-w-[1440px] flex-1 flex-col overflow-visible px-4 pt-4 pb-8 md:max-h-full md:overflow-hidden md:pt-6 md:pb-3">
      <div ref={topRef} />
      <Card className="mx-auto flex h-full min-h-0 w-full max-w-[1220px] flex-1 flex-col overflow-visible border border-border bg-card pt-6 pb-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] md:max-h-full md:overflow-hidden">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-8 overflow-visible px-6 pt-6 pb-0 text-card-foreground md:overflow-hidden">
          <div className="mx-auto flex min-h-0 w-full max-w-[730px] flex-1 flex-col overflow-hidden">
            {/* ============ Step 1 — Introducite ============ */}
            {stepIndex === 0 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                  <div className="space-y-2">
                    <h1 className="text-[36px] leading-[40px] font-extrabold">
                      Lanzá una Señal: Introducite
                    </h1>
                    <p className="text-sm leading-5 text-muted-foreground">
                      Hacé saber que estás buscando hospedaje; rellená tu información
                      básica en este primer paso (vas a poder describirte con tus propias
                      palabras en el último paso).
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signal-fullname">Nombre y apellido</Label>
                      <Input
                        id="signal-fullname"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ken Adams"
                        maxLength={120}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SignalSteppedMeter
                        id="signal-age"
                        label="Edad"
                        min={16}
                        max={120}
                        value={Math.min(120, Math.max(16, Number(age) || 18))}
                        onChange={(n) => setAge(String(n))}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="signal-gender">Género</Label>
                        <Select value={gender} onValueChange={(v) => setGender(v ?? "")}>
                          <SelectTrigger id="signal-gender" className="w-full">
                            <SelectValue placeholder="Definí tu género">
                              {(value) => {
                                const v =
                                  typeof value === "string" ? value : "";
                                if (!v) return "Definí tu género";
                                return (
                                  GENDER_OPTIONS.find((o) => o.value === v)
                                    ?.label ?? v
                                );
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="signal-country">País de origen</Label>
                      <Select
                        value={countryOfOrigin}
                        onValueChange={(v) => setCountryOfOrigin(v ?? "")}
                      >
                        <SelectTrigger id="signal-country" className="w-full">
                          <SelectValue placeholder="Elegí un país">
                            {(value) => {
                              const v = typeof value === "string" ? value : "";
                              if (!v) return "Elegí un país";
                              return v;
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* ============ Step 2 — Dejate ver ============ */}
            {stepIndex === 1 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                  <div className="space-y-2">
                    {photos.length === 0 ? (
                      <>
                        <h1 className="text-[36px] leading-[40px] font-extrabold">
                          Dejate ver
                        </h1>
                        <p className="text-sm leading-5 text-muted-foreground">
                          La foto es opcional, pero tené en cuenta que los anfitriones
                          confían más en señales con cara visible. Tu foto puede pesar como
                          máximo 4 MB. Si pesa más, la vamos a comprimir automáticamente al
                          subirla.
                        </p>
                      </>
                    ) : (
                      <>
                        <h1 className="text-[36px] leading-[40px] font-extrabold">
                          ¡Genial!
                        </h1>
                        <p className="text-sm leading-5 text-muted-foreground">
                          Esta es tu foto de perfil. Podés reemplazarla o quitarla cuando
                          quieras.
                        </p>
                      </>
                    )}
                    {photoUploadError ? (
                      <p className="text-sm text-destructive" role="alert">
                        {photoUploadError}
                      </p>
                    ) : null}
                    {photoUploadingCount > 0 ? (
                      <p className="text-xs text-muted-foreground">Subiendo foto…</p>
                    ) : null}
                  </div>

                  {photos.length === 0 ? (
                    <label
                      className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-4 py-12 text-sm text-muted-foreground transition-colors hover:bg-muted/20"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        void addFiles(e.dataTransfer.files);
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) void addFiles(files);
                          e.currentTarget.value = "";
                        }}
                      />
                      <div className="flex flex-col items-center gap-3">
                        <ImagePlus className="size-6" aria-hidden />
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground shadow-xs">
                          <Upload className="size-4" aria-hidden />
                          Cargar imagen
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (Podés arrastrar y soltar aquí)
                        </span>
                      </div>
                    </label>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={({ active, over }) => {
                        if (!over || active.id === over.id) return;
                        setPhotos((prev) => {
                          const oldIndex = prev.findIndex((p) => p.id === active.id);
                          const newIndex = prev.findIndex((p) => p.id === over.id);
                          if (oldIndex === -1 || newIndex === -1) return prev;
                          return arrayMove(prev, oldIndex, newIndex);
                        });
                      }}
                    >
                      <SortableContext
                        items={photos.map((p) => p.id)}
                        strategy={rectSortingStrategy}
                      >
                        {photos[0] ? (
                          <SortablePhoto
                            key={photos[0].id}
                            photo={photos[0]}
                            variant="hero"
                            index={0}
                            total={photos.length}
                            onDelete={() => removePhoto(photos[0].id)}
                            onReplace={(file) => void replacePhoto(photos[0].id, file)}
                            onMoveEarlier={() =>
                              movePhotoInList(photos[0].id, "earlier")
                            }
                            onMoveLater={() => movePhotoInList(photos[0].id, "later")}
                          />
                        ) : null}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            ) : null}

            {/* ============ Step 3 — Los básicos ============ */}
            {stepIndex === 2 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                    <div className="space-y-2">
                      <h1 className="text-[36px] leading-[40px] font-extrabold">
                        Más sobre vos
                      </h1>
                      <p className="text-sm leading-5 text-muted-foreground">
                        Información importante que puede ayudarte a encontrarte un
                        anfitrión con tu misma vibra.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signal-occupation">
                        ¿Cuál de estas opciones te describe mejor en este momento?
                      </Label>
                      <Select value={occupation} onValueChange={(v) => setOccupation(v ?? "")}>
                        <SelectTrigger id="signal-occupation" className="w-full">
                          <SelectValue placeholder="Elegí una" />
                        </SelectTrigger>
                        <SelectContent>
                          {OCCUPATION_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe2 className="size-4 text-foreground" aria-hidden />
                        ¿Qué idiomas hablás?
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Marcá todos los que apliquen.
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {LANGUAGE_OPTIONS.map((opt) => {
                          const checked = languages.includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                                checked
                                  ? "border-foreground/70 bg-muted/25"
                                  : "border-border bg-muted/5 hover:bg-muted/15",
                              )}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  setLanguages((prev) =>
                                    toggleArrayValue(prev, opt.value),
                                  )
                                }
                                className="shrink-0"
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signal-moving-with">¿Quién busca habitación?</Label>
                      <Select value={movingWith} onValueChange={(v) => setMovingWith(v ?? "")}>
                        <SelectTrigger id="signal-moving-with" className="w-full">
                          <SelectValue placeholder="Elegí una" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOVING_WITH_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
            ) : null}

            {/* ============ Step 4 — Un poco más sobre vos ============ */}
            {stepIndex === 3 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                    <div className="space-y-2">
                      <h1 className="text-[36px] leading-[40px] font-extrabold">
                        Opcional, pero muy útil
                      </h1>
                      <p className="text-sm leading-5 text-muted-foreground">
                        Un último poquito de información.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signal-time-use">
                        Contá cómo pasás la mayoría de tu tiempo
                      </Label>
                      <Textarea
                        id="signal-time-use"
                        rows={4}
                        maxLength={280}
                        value={timeUseDescription}
                        onChange={(e) => setTimeUseDescription(e.target.value)}
                        placeholder="Ej. Trabajo desde casa de día y suelo salir los fines de semana."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signal-indoor-outdoor">
                        Preferís pasar más tiempo dentro o fuera de la casa?
                      </Label>
                      <Textarea
                        id="signal-indoor-outdoor"
                        rows={4}
                        maxLength={280}
                        value={indoorOutdoorDescription}
                        onChange={(e) => setIndoorOutdoorDescription(e.target.value)}
                        placeholder="Ej. Equilibrado, salgo seguido pero también disfruto un buen día en casa."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SignalSteppedMeter
                        id="signal-cleanliness"
                        label="Nivel de limpieza?"
                        value={cleanlinessImportance}
                        onChange={setCleanlinessImportance}
                      />
                      <SignalSteppedMeter
                        id="signal-order"
                        label="Nivel de orden?"
                        value={orderImportance}
                        onChange={setOrderImportance}
                      />
                    </div>
                  </div>
                </div>
            ) : null}

            {/* ============ Step 5 — Esto es real? ============ */}
            {stepIndex === 4 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                    <div className="space-y-2">
                      <h1 className="text-[36px] leading-[40px] font-extrabold">
                        ¿Esto es real?
                      </h1>
                      <p className="text-sm leading-5 text-muted-foreground">
                        Opcionales, pero compartir alguna de tus redes le suma confianza a
                        tu anfitrión.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="signal-instagram">Instagram</Label>
                        <Input
                          id="signal-instagram"
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          placeholder="@usuario"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signal-twitter">X / Twitter</Label>
                        <Input
                          id="signal-twitter"
                          value={twitterHandle}
                          onChange={(e) => setTwitterHandle(e.target.value)}
                          placeholder="@usuario"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signal-facebook">Facebook</Label>
                        <Input
                          id="signal-facebook"
                          value={facebookHandle}
                          onChange={(e) => setFacebookHandle(e.target.value)}
                          placeholder="@usuario o URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signal-tiktok">TikTok</Label>
                        <Input
                          id="signal-tiktok"
                          value={tiktokHandle}
                          onChange={(e) => setTiktokHandle(e.target.value)}
                          placeholder="@usuario"
                        />
                      </div>
                    </div>
                  </div>
                </div>
            ) : null}

            {/* ============ Step 6 — Cuándo ============ */}
            {stepIndex === 5 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                    <div className="space-y-2">
                      <h1 className="text-[36px] leading-[40px] font-extrabold">
                        Para cuándo buscás?
                      </h1>
                      <p className="text-sm leading-5 text-muted-foreground">
                        Podés elegir entre tres modos: fechas exactas, rangos flexibles, o
                        simplemente marcar que buscás urgente.
                      </p>
                    </div>

                    <RadioGroup
                      value={dateMode}
                      onValueChange={(v) => {
                        setDateMode(v);
                      }}
                      className="flex flex-col gap-1 rounded-full border border-border bg-muted/20 p-1 sm:flex-row sm:items-stretch"
                    >
                      {[
                        { value: "exact", label: "Fechas exactas" },
                        { value: "flex", label: "Rangos flexibles" },
                        { value: "asap", label: "Busco urgente" },
                      ].map((o) => {
                        const checked = dateMode === o.value;
                        return (
                          <label
                            key={o.value}
                            className={cn(
                              "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-2 py-2.5 text-center text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
                              checked
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <RadioGroupItem
                              value={o.value}
                              id={`signal-mode-${o.value}`}
                              className="size-3.5 shrink-0"
                            />
                            <span className="leading-tight">{o.label}</span>
                          </label>
                        );
                      })}
                    </RadioGroup>

                    {dateMode === "exact" ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="signal-checkin">Check-in</Label>
                            <Input
                              id="signal-checkin"
                              type="date"
                              value={exactCheckIn}
                              onChange={(e) => setExactCheckIn(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signal-checkout">Check-out</Label>
                            <Input
                              id="signal-checkout"
                              type="date"
                              value={exactCheckOut}
                              onChange={(e) => setExactCheckOut(e.target.value)}
                              min={exactCheckIn || undefined}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signal-flex-days">Flexibilidad</Label>
                          <Select
                            value={String(exactFlexDays)}
                            onValueChange={(v) => setExactFlexDays(Number(v))}
                          >
                            <SelectTrigger id="signal-flex-days" className="w-full">
                              <SelectValue placeholder="± días" />
                            </SelectTrigger>
                            <SelectContent>
                              {FLEX_DAYS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={String(o.value)}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : null}

                    {dateMode === "flex" ? (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label>¿Por cuánto tiempo te querés quedar?</Label>
                          <div className="flex flex-wrap gap-2">
                            {FLEX_STAY_OPTIONS.map((opt) => {
                              const active = flexStayLengths.includes(opt.value);
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    setFlexStayLengths((prev) =>
                                      toggleArrayValue(prev, opt.value),
                                    )
                                  }
                                  className={cn(
                                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                                    active
                                      ? "border-foreground bg-foreground text-background"
                                      : "border-border bg-background hover:bg-foreground/10",
                                  )}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>¿Durante qué meses?</Label>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {monthOptions.map((m) => {
                              const active = flexMonths.includes(m.ym);
                              return (
                                <button
                                  key={m.ym}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    setFlexMonths((prev) =>
                                      toggleArrayValue(prev, m.ym),
                                    )
                                  }
                                  className={cn(
                                    "rounded-xl border px-2 py-3 text-sm font-medium transition-colors",
                                    active
                                      ? "border-foreground bg-foreground text-background"
                                      : "border-border bg-background hover:bg-foreground/10",
                                  )}
                                >
                                  <span className="block capitalize">{m.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {dateMode === "asap" ? (
                      <div className="flex gap-3 rounded-[10px] border border-border bg-muted/10 p-4">
                        <div
                          className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-foreground bg-foreground text-background"
                          aria-hidden
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </div>
                        <p className="text-sm leading-snug text-foreground">
                          Te marcamos como buscando urgente. Los anfitriones con avisos
                          activos te van a ver primero.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
            ) : null}

            {/* ============ Step 7 — Dónde? (zonas) ============ */}
            {stepIndex === 6 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                  <div className="space-y-2">
                    <h1 className="text-[36px] leading-[40px] font-extrabold">Dónde?</h1>
                    <p className="text-sm leading-5 text-muted-foreground">
                      Podés elegir tus zonas de preferencia o saltearte este paso.
                    </p>
                  </div>

                  <section className="space-y-3">
                    <BarcelonaZonePicker
                      formId="signal-wizard-zones"
                      autoSubmit={false}
                      variant="wizard"
                      zones={preferredZones}
                      onChangeZones={(z) => setPreferredZones(z)}
                    />
                  </section>
                </div>
              </div>
            ) : null}

            {/* ============ Step 8 — Hacé match con habitaciones ============ */}
            {stepIndex === 7 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                  <div className="space-y-2">
                    <h1 className="text-[36px] leading-[40px] font-extrabold">
                      Hacé match con habitaciones
                    </h1>
                    <p className="text-sm leading-5 text-muted-foreground">
                      Marcá las características que te gustaría que tenga tu habitación. Todo
                      es opcional, pero cuanto más completes, mejor te podremos cruzar con
                      las habitaciones cargadas.
                    </p>
                  </div>

                  <section className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Tamaño de cama</p>
                    <div className="flex flex-col gap-2">
                      {(["INDIVIDUAL", "DOBLE"] as const).map((v) => {
                        const active = preferredBedSizes.includes(v);
                        return (
                          <label
                            key={v}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2.5 text-sm transition-colors",
                              active
                                ? "border-foreground bg-muted/20"
                                : "border-border bg-muted/5 hover:bg-muted/15",
                            )}
                          >
                            <Checkbox
                              checked={active}
                              onCheckedChange={() =>
                                setPreferredBedSizes((prev) => toggleArrayValue(prev, v))
                              }
                              className="shrink-0"
                            />
                            <span>{BED_SIZE_LABELS[v]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Ventana</p>
                    <div className="flex flex-col gap-2">
                      {(
                        [
                          "CALLE",
                          "CORAZON_DE_MANZANA",
                          "POZO_DE_AIRE",
                          "SIN_VENTANA",
                        ] as const
                      ).map((v) => {
                        const active = preferredWindowTypes.includes(v);
                        return (
                          <label
                            key={v}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2.5 text-sm transition-colors",
                              active
                                ? "border-foreground bg-muted/20"
                                : "border-border bg-muted/5 hover:bg-muted/15",
                            )}
                          >
                            <Checkbox
                              checked={active}
                              onCheckedChange={() =>
                                setPreferredWindowTypes((prev) =>
                                  toggleArrayValue(prev, v),
                                )
                              }
                              className="shrink-0"
                            />
                            <span>{WINDOW_TYPE_LABELS[v]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  <Separator />

                  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Ruler className="size-4 text-foreground" aria-hidden />
                        Tamaño aproximado de la habitación (m²)
                      </Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={150}
                        value={preferredRoomSizeSqmMin}
                        onChange={(e) => setPreferredRoomSizeSqmMin(e.target.value)}
                        placeholder="Da igual"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Home className="size-4 text-foreground" aria-hidden />
                        Tamaño aproximado del piso (m²)
                      </Label>
                      <Select
                        value={preferredApartmentSizeSqmMin}
                        onValueChange={(v) => setPreferredApartmentSizeSqmMin(v ?? "")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Da igual" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Da igual</SelectItem>
                          {APARTMENT_SIZE_STEPS.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}+ m²
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </section>

                  <Separator />

                  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Sofa className="size-4 text-foreground" aria-hidden />
                        Habitación amueblada
                      </Label>
                      <Select
                        value={preferredFurnished}
                        onValueChange={(v) => setPreferredFurnished(v ?? "any")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Da igual</SelectItem>
                          <SelectItem value="si">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DoorOpen className="size-4 text-foreground" aria-hidden />
                        Nº de habitaciones en el piso
                      </Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={20}
                        value={preferredApartmentRoomsMin}
                        onChange={(e) => setPreferredApartmentRoomsMin(e.target.value)}
                        placeholder="Da igual"
                      />
                    </div>
                  </section>

                  <Separator />

                  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Bath className="size-4 text-foreground" aria-hidden />
                        Nº de baños en el piso
                      </Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={20}
                        value={preferredApartmentBathsMin}
                        onChange={(e) => setPreferredApartmentBathsMin(e.target.value)}
                        placeholder="Da igual"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Wifi className="size-4 text-foreground" aria-hidden />
                        WIFI
                      </Label>
                      <Select value={preferredWifi} onValueChange={(v) => setPreferredWifi(v ?? "any")}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Da igual</SelectItem>
                          <SelectItem value="si">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </section>
                </div>
              </div>
            ) : null}

            {/* ============ Step 9 — Presentate ============ */}
            {stepIndex === 8 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                    <div className="space-y-2">
                      <h1 className="text-[36px] leading-[40px] font-extrabold">
                        Presentate con tus palabras
                      </h1>
                      <p className="text-sm leading-5 text-muted-foreground">
                        Mínimo 10 caracteres. Esto es lo que va a leer cada anfitrión que
                        reciba tu señal.
                      </p>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-input bg-input/30 px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-pressed={editor?.isActive("bold") ?? false}
                            className={cn(
                              "rounded-lg hover:bg-foreground/15 hover:text-foreground dark:hover:bg-foreground/15 dark:hover:text-foreground",
                              editor?.isActive("bold") &&
                                "bg-foreground/15 text-foreground dark:bg-foreground/15",
                            )}
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            aria-label="Negrita"
                          >
                            <Bold className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-pressed={editor?.isActive("italic") ?? false}
                            className={cn(
                              "rounded-lg hover:bg-foreground/15 hover:text-foreground dark:hover:bg-foreground/15 dark:hover:text-foreground",
                              editor?.isActive("italic") &&
                                "bg-foreground/15 text-foreground dark:bg-foreground/15",
                            )}
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            aria-label="Cursiva"
                          >
                            <Italic className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-pressed={editor?.isActive("bulletList") ?? false}
                            className={cn(
                              "rounded-lg hover:bg-foreground/15 hover:text-foreground dark:hover:bg-foreground/15 dark:hover:text-foreground",
                              editor?.isActive("bulletList") &&
                                "bg-foreground/15 text-foreground dark:bg-foreground/15",
                            )}
                            onClick={() =>
                              editor?.chain().focus().toggleBulletList().run()
                            }
                            aria-label="Lista con viñetas"
                          >
                            <List className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </div>

                      <div
                        className="min-h-[220px] w-full cursor-text rounded-xl border border-input bg-input/30 px-3 py-3 outline-none transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 [&_.ProseMirror]:min-h-[200px]"
                        onMouseDown={(e) => {
                          if (!editor) return;
                          if (e.target === e.currentTarget) editor.chain().focus().run();
                        }}
                      >
                        <EditorContent editor={editor} />
                      </div>
                    </div>
                  </div>
                </div>
            ) : null}

            {/* ============ Step 10 — Notificaciones ============ */}
            {stepIndex === 9 ? (
              <div
                className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain"
                data-wizard-scroll
              >
                <div className="my-auto w-full space-y-6 py-10 md:py-20">
                    <div className="space-y-2">
                      <h1 className="text-[36px] leading-[40px] font-extrabold">
                        Por último: notificaciones
                      </h1>
                      <p className="text-sm leading-5 text-muted-foreground">
                        Decinos si, y cómo, querés que te contactemos por habitaciones que
                        te puedan servir.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <WizardNotificationRow
                        checked={listingAlertInApp}
                        onChange={setListingAlertInApp}
                        disabled={savingNext}
                        label="Quiero recibir mensajes sobre habitaciones que encajen con mi señal en la plataforma"
                      />
                      <WizardNotificationRow
                        checked={listingAlertEmail}
                        onChange={setListingAlertEmail}
                        disabled={savingNext}
                        label="Quiero recibir mensajes sobre habitaciones que encajen con mi señal por email"
                      />
                    </div>
                  </div>
                </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-border pt-4">
            {submitError ? (
              <p className="mb-4 text-sm text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out"
                style={{ width: `${Math.round(progressValue * 100)}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                type="button"
                variant={stepIndex === 0 ? "default" : "secondary"}
                size="sm"
                className="rounded-full"
                onClick={handleBack}
                aria-label={stepIndex === 0 ? "Cancelar" : "Paso anterior"}
              >
                {stepIndex === 0 ? "Cancelar" : "Atrás"}
              </Button>

              <Button
                type="button"
                variant={isLastStep || isStepComplete ? "default" : "secondary"}
                size="sm"
                className="rounded-full"
                disabled={
                  !canGoNext ||
                  savingNext ||
                  (stepIndex === 1 && photoUploadingCount > 0)
                }
                onClick={() => {
                  if (isLastStep) void handlePublish();
                  else void handleNext();
                }}
              >
                {primaryFooterLabel}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SupportEncontrateDialog
        open={publishedId !== null}
        reason="signal_published"
        onClose={() => {
          setPublishedId(null);
          router.push("/mis-cosas/signals");
        }}
      />

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="gap-4 border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Salir de crear señal?</DialogTitle>
            <DialogDescription>
              Tu progreso se guarda como borrador. Podés volver más tarde desde el Panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setCancelDialogOpen(false)}
            >
              Seguir editando
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={() => {
                setCancelDialogOpen(false);
                router.push("/");
              }}
            >
              Salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
