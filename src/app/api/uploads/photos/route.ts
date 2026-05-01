import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";

export const runtime = "nodejs";

/** Vercel server uploads are capped (~4.5MB); stay under that. */
const maxBytes = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión." },
      { status: 401 },
    );
  }
  if (!isUserApproved(session)) {
    return NextResponse.json(
      { error: "Tu cuenta está pendiente de aprobación." },
      { status: 403 },
    );
  }

  const formData = await req.formData();
  const raw = formData.get("file");
  // Node / Next may expose multipart parts as Blob rather than File — accept both.
  if (!(raw instanceof Blob)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  if (raw.size === 0) {
    return NextResponse.json({ error: "El archivo está vacío." }, { status: 400 });
  }

  const name = raw instanceof File ? raw.name : "";
  const mime = raw.type || "";
  if (!isAllowedImage({ mime, fileName: name })) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes (JPEG, PNG, WebP, GIF, HEIC…)." },
      { status: 400 },
    );
  }

  if (raw.size > maxBytes) {
    return NextResponse.json(
      { error: "La imagen es demasiado grande (máx. 4 MB)." },
      { status: 413 },
    );
  }

  const ext = extensionForUpload(mime, name);
  const safeName = `listing-photo-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}${ext}`;

  try {
    const blob = await put(safeName, raw, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[uploads/photos]", err);
    return NextResponse.json(
      {
        error:
          "No se pudo guardar la imagen. Si estás en local, configurá BLOB_READ_WRITE_TOKEN.",
      },
      { status: 503 },
    );
  }
}

function isAllowedImage(input: { mime: string; fileName: string }): boolean {
  if (input.mime.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|avif|bmp)$/i.test(input.fileName);
}

function extensionForUpload(mime: string, fileName: string): string {
  const fromMime = guessExt(mime);
  if (fromMime) return fromMime;
  const m = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  if (m) {
    const ext = m[1].toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "heic", "avif", "bmp"].includes(ext)) {
      return `.${ext === "jpeg" ? "jpg" : ext}`;
    }
  }
  return ".jpg";
}

function guessExt(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "image/jpeg" || mime === "image/jpg") return ".jpg";
  if (mime === "image/heic" || mime === "image/heif") return ".heic";
  if (mime === "image/avif") return ".avif";
  if (mime === "image/bmp") return ".bmp";
  return "";
}

