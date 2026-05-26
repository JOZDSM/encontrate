import { Font } from "@react-pdf/renderer";

let registered = false;

/** Figtree — same family as `layout.tsx` (`--font-sans`). */
export function ensureListingPdfFonts(): void {
  if (registered) return;

  Font.register({
    family: "Figtree",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/figtree@5.2.8/files/figtree-latin-400-normal.ttf",
        fontWeight: 400,
      },
      {
        src: "https://cdn.jsdelivr.net/npm/@fontsource/figtree@5.2.8/files/figtree-latin-600-normal.ttf",
        fontWeight: 600,
      },
    ],
  });

  registered = true;
}
