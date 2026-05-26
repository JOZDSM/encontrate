/**
 * Light-theme tokens aligned with `:root` in `src/app/globals.css`.
 * Listing detail uses plain `bg-background` (no rotating hero).
 */
export const listingPdfTokens = {
  background: "#ffffff",
  foreground: "#252525",
  mutedForeground: "#737373",
  muted: "#f7f7f7",
  secondary: "#f7f7f7",
  secondaryForeground: "#333333",
  border: "#ebebeb",
  cardFill: "#fafafa",
  photoWell: "#f9f9f9",
  fontFamily: "Figtree",
  /** Page horizontal padding — `px-4` */
  padX: 16,
  /** Section top padding — `pt-8` */
  padTop: 24,
  padBottom: 36,
  /** `my-8` between sections */
  sectionGap: 32,
  /** `rounded-2xl` @ radius 0.625rem */
  radius2xl: 11,
  /** Badge pill — `rounded-4xl` */
  radiusPill: 20,
  /** `text-3xl` / `sm:text-4xl` title */
  titleSize: 27,
  /** `text-lg` section headings */
  headingSize: 14,
  /** `text-sm` body */
  bodySize: 11,
  /** `text-xs` badge */
  captionSize: 9,
  /** Gallery `aspect-[16/10]` inner width at 390pt page − 2×padX */
  photoWidth: 358,
  photoHeight: 224,
} as const;
