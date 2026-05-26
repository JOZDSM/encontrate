/**
 * Dark-theme tokens aligned with `.dark` in `src/app/globals.css`.
 * PDF export matches the site’s default dark UI (listing detail uses `bg-background`).
 */
export const listingPdfTokens = {
  background: "#262626",
  foreground: "#fafafa",
  mutedForeground: "#adadad",
  muted: "#434343",
  secondary: "#434343",
  secondaryForeground: "#fafafa",
  border: "#3a3a3a",
  cardFill: "#2c2c2c",
  photoWell: "#282828",
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
