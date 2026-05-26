import path from "node:path";
import { Font } from "@react-pdf/renderer";

let registered = false;

function figtreeFontFile(name: string): string {
  return path.join(
    process.cwd(),
    "node_modules/@fontsource/figtree/files",
    name,
  );
}

/** Figtree — same family as `layout.tsx` (`--font-sans`). Loaded from disk (no CDN). */
export function ensureListingPdfFonts(): void {
  if (registered) return;

  Font.register({
    family: "Figtree",
    fonts: [
      {
        src: figtreeFontFile("figtree-latin-400-normal.woff"),
        fontWeight: 400,
      },
      {
        src: figtreeFontFile("figtree-latin-600-normal.woff"),
        fontWeight: 600,
      },
    ],
  });

  registered = true;
}
