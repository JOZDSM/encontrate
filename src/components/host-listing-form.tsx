"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createListing, updateListing } from "@/app/actions/listings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BARCELONA_ZONE_LABELS, BARCELONA_ZONE_ORDER } from "@/lib/barcelona-zones";
import {
  LISTING_WINDOW_OPTIONS,
  type ListingWindowValue,
} from "@/lib/listing-window-options";
import { cn } from "@/lib/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List } from "lucide-react";

type Defaults = {
  title: string;
  description: string;
  city: string;
  country: string;
  neighborhood: string;
  addressDetail: string;
  priceMonthlyEur: number | null;
  priceNote: string;
  timeZone: string;
  photoUrlsText: string;

  bedSize: "INDIVIDUAL" | "DOBLE";
  windowTypes: ListingWindowValue[];
  roomSizeSqm: number;
  furnished: boolean;
  apartmentRooms: number;
  apartmentBaths: number;
  apartmentSizeSqm: number;
  wifi: boolean;
};

const empty: Defaults = {
  title: "",
  description: "",
  city: "Barcelona",
  country: "España",
  neighborhood: "",
  addressDetail: "",
  priceMonthlyEur: null,
  priceNote: "",
  timeZone: "Europe/Madrid",
  photoUrlsText: "",

  bedSize: "INDIVIDUAL",
  windowTypes: ["CALLE"],
  roomSizeSqm: 10,
  furnished: true,
  apartmentRooms: 3,
  apartmentBaths: 1,
  apartmentSizeSqm: 80,
  wifi: true,
};

export function HostListingForm({
  listingId,
  defaults,
}: {
  listingId?: string;
  defaults?: Partial<Defaults>;
}) {
  const router = useRouter();
  const d = { ...empty, ...defaults };
  const [title, setTitle] = useState(d.title);
  const [description, setDescription] = useState(d.description);
  const [city, setCity] = useState(d.city);
  const [country, setCountry] = useState(d.country);
  const [neighborhood, setNeighborhood] = useState(d.neighborhood);
  const [addressDetail, setAddressDetail] = useState(d.addressDetail);
  const [priceMonthlyEur, setPriceMonthlyEur] = useState<number | null>(
    d.priceMonthlyEur,
  );
  const [priceNote, setPriceNote] = useState(d.priceNote);
  const [timeZone, setTimeZone] = useState(d.timeZone);
  const [photoUrlsText, setPhotoUrlsText] = useState(d.photoUrlsText);

  const [bedSize, setBedSize] = useState<Defaults["bedSize"]>(d.bedSize);
  const [windowTypes, setWindowTypes] = useState<Defaults["windowTypes"]>(
    d.windowTypes,
  );
  const [roomSizeSqm, setRoomSizeSqm] = useState(d.roomSizeSqm);
  const [furnished, setFurnished] = useState(d.furnished);
  const [apartmentRooms, setApartmentRooms] = useState(d.apartmentRooms);
  const [apartmentBaths, setApartmentBaths] = useState(d.apartmentBaths);
  const [apartmentSizeSqm, setApartmentSizeSqm] = useState(d.apartmentSizeSqm);
  const [wifi, setWifi] = useState(d.wifi);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder: "Describí tu habitación y el piso…",
      }),
    ],
    content: description,
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none text-sm leading-5 text-foreground [&_p]:m-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1",
      },
    },
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
  });

  const serverDescription = defaults?.description ?? "";

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(serverDescription || "");
  }, [editor, listingId, serverDescription]);

  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => setSuccess(null), 2500);
    return () => window.clearTimeout(id);
  }, [success]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const photoUrls = photoUrlsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const payload = {
      title,
      description: (editor?.getHTML() ?? description).trim(),
      city,
      country,
      neighborhood,
      addressDetail: addressDetail || null,
      priceMonthlyEur,
      priceNote: priceNote || null,
      timeZone,
      photoUrls,

      bedSize,
      windowTypes,
      roomSizeSqm,
      furnished,
      apartmentRooms,
      apartmentBaths,
      apartmentSizeSqm,
      wifi,
    };
    const res = listingId
      ? await updateListing(listingId, payload)
      : await createListing(payload);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (listingId) {
      router.refresh();
      setSuccess("Cambios guardados.");
    } else if ("id" in res) {
      router.push(`/host/listings/${res.id}/edit`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <div id="description" aria-label="Descripción" className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-input bg-input/30 px-3 py-2">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className={cn(
                  "rounded-lg",
                  editor?.isActive("bold") ? "bg-muted" : "",
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
                className={cn(
                  "rounded-lg",
                  editor?.isActive("italic") ? "bg-muted" : "",
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
                className={cn(
                  "rounded-lg",
                  editor?.isActive("bulletList") ? "bg-muted" : "",
                )}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                aria-label="Lista con viñetas"
              >
                <List className="size-4" aria-hidden />
              </Button>
            </div>
          </div>

          <div
            className="min-h-[140px] w-full cursor-text rounded-xl border border-input bg-input/30 px-3 py-3 outline-none transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 [&_.ProseMirror]:min-h-[140px]"
            onMouseDown={(e) => {
              if (!editor) return;
              e.preventDefault();
              editor.chain().focus().run();
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Barrio (público)</Label>
        <Select
          value={neighborhood}
          onValueChange={(v) => setNeighborhood(v ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Elegí un barrio" />
          </SelectTrigger>
          <SelectContent>
            {BARCELONA_ZONE_ORDER.map((slug) => (
              <SelectItem key={slug} value={BARCELONA_ZONE_LABELS[slug]}>
                {BARCELONA_ZONE_LABELS[slug]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="addressDetail">Dirección completa (solo tras confirmar)</Label>
        <Textarea
          id="addressDetail"
          value={addressDetail}
          onChange={(e) => setAddressDetail(e.target.value)}
          rows={2}
          placeholder="Opcional. Visible al huésped con reserva confirmada."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priceMonthlyEur">Precio mensual (EUR)</Label>
          <Input
            id="priceMonthlyEur"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={priceMonthlyEur ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setPriceMonthlyEur(v.trim() === "" ? null : Number(v));
            }}
            placeholder="Ej. 650"
          />
          <p className="text-xs text-muted-foreground">
            Usado para ordenar por precio. No se cobra dentro de encontrate.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceNote">Precio orientativo (texto)</Label>
          <Input
            id="priceNote"
            value={priceNote}
            onChange={(e) => setPriceNote(e.target.value)}
            placeholder="Ej. 650 €/mes o 40 €/noche"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="timeZone">Zona horaria IANA</Label>
        <Input
          id="timeZone"
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="photos">URLs de fotos (una por línea, https…)</Label>
        <Textarea
          id="photos"
          value={photoUrlsText}
          onChange={(e) => setPhotoUrlsText(e.target.value)}
          rows={4}
          placeholder="https://…"
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">Características de la habitación</p>

        <div className="space-y-2">
          <Label>Tamaño de cama</Label>
          <Select value={bedSize} onValueChange={(v) => setBedSize(v as Defaults["bedSize"])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegí tamaño de cama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              <SelectItem value="DOBLE">Doble</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Ventana</Label>
          <p className="text-xs text-muted-foreground">
            Podés marcar más de una si aplica.
          </p>
          <div className="space-y-3">
            {LISTING_WINDOW_OPTIONS.map((opt) => {
              const checked = windowTypes.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors",
                    checked
                      ? "border-foreground/70 bg-muted/25"
                      : "border-border bg-muted/5 hover:bg-muted/15",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => {
                      const on = v === true;
                      setWindowTypes((prev) => {
                        if (on) {
                          return prev.includes(opt.value)
                            ? prev
                            : [...prev, opt.value];
                        }
                        return prev.filter((x) => x !== opt.value);
                      });
                    }}
                    className="mt-1 shrink-0"
                    aria-labelledby={`host-form-win-${opt.value}-title`}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span
                      id={`host-form-win-${opt.value}-title`}
                      className="block text-sm font-semibold text-foreground"
                    >
                      {opt.title}
                    </span>
                    <span className="block text-sm leading-5 text-muted-foreground">
                      {opt.description}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomSizeSqm">Tamaño aprox. de la habitación (m²)</Label>
          <Select
            value={String(roomSizeSqm)}
            onValueChange={(v) => setRoomSizeSqm(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegí tamaño" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 m²</SelectItem>
              <SelectItem value="10">10 m²</SelectItem>
              <SelectItem value="15">15 m²</SelectItem>
              <SelectItem value="20">20 m²</SelectItem>
              <SelectItem value="21">+20 m²</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Amueblada</Label>
          <Select
            value={furnished ? "yes" : "no"}
            onValueChange={(v) => setFurnished(v === "yes")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Sí</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">Características del piso</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="apartmentRooms">Número de habitaciones</Label>
            <Input
              id="apartmentRooms"
              type="number"
              min={1}
              max={20}
              step={1}
              required
              value={apartmentRooms}
              onChange={(e) => setApartmentRooms(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apartmentBaths">Número de baños</Label>
            <Input
              id="apartmentBaths"
              type="number"
              min={1}
              max={20}
              step={1}
              required
              value={apartmentBaths}
              onChange={(e) => setApartmentBaths(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apartmentSizeSqm">Tamaño aprox. del piso (m²)</Label>
          <Select
            value={String(apartmentSizeSqm)}
            onValueChange={(v) => setApartmentSizeSqm(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegí tamaño" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 25 }).map((_, i) => {
                const val = (i + 4) * 10;
                return (
                  <SelectItem key={val} value={String(val)}>
                    {val} m²
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Wifi</Label>
          <Select value={wifi ? "yes" : "no"} onValueChange={(v) => setWifi(v === "yes")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Sí</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? (
        <p className="text-sm font-medium text-foreground">{success}</p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : listingId ? "Guardar cambios" : "Publicar"}
      </Button>
    </form>
  );
}
