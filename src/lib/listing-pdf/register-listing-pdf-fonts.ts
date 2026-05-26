import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Font } from "@react-pdf/renderer";

let registered = false;

const moduleFontsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fonts",
);

/** Resolve vendored Figtree files across dev, build output, and Vercel layouts. */
function resolveFigtreeFontPath(fileName: string): string {
  const candidates = [
    path.join(moduleFontsDir, fileName),
    path.join(process.cwd(), "src/lib/listing-pdf/fonts", fileName),
    path.join(process.cwd(), "public/fonts/figtree", fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    `PDF font missing: ${fileName} (checked ${candidates.join(", ")})`,
  );
}

/** Figtree — same family as `layout.tsx` (`--font-sans`). */
export function ensureListingPdfFonts(): void {
  if (registered) return;

  Font.register({
    family: "Figtree",
    fonts: [
      {
        src: resolveFigtreeFontPath("figtree-latin-400-normal.woff"),
        fontWeight: 400,
      },
      {
        src: resolveFigtreeFontPath("figtree-latin-600-normal.woff"),
        fontWeight: 600,
      },
    ],
  });

  registered = true;
}
