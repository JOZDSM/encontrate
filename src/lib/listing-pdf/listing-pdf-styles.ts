import { StyleSheet } from "@react-pdf/renderer";
import { listingPdfTokens as t } from "@/lib/listing-pdf/listing-pdf-tokens";

/** Portrait page size (pt), iPhone-ish width at 72 dpi. */
export const LISTING_PDF_PAGE_WIDTH = 390;
export const LISTING_PDF_PAGE_HEIGHT = 844;

export const listingPdfPageSize: [number, number] = [
  LISTING_PDF_PAGE_WIDTH,
  LISTING_PDF_PAGE_HEIGHT,
];

const basePage = {
  backgroundColor: t.background,
  color: t.foreground,
  fontFamily: t.fontFamily,
  fontSize: t.bodySize,
  paddingTop: t.padTop,
  paddingBottom: t.padBottom,
  paddingHorizontal: t.padX,
};

export const listingPdfStyles = StyleSheet.create({
  page: {
    ...basePage,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: t.secondary,
    borderRadius: t.radiusPill,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: t.captionSize,
    fontWeight: 600,
    color: t.secondaryForeground,
  },
  title: {
    fontSize: t.titleSize,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -0.3,
    marginBottom: 8,
    color: t.foreground,
  },
  pricePrimary: {
    fontSize: t.bodySize,
    fontWeight: 600,
    color: t.foreground,
    marginBottom: 2,
  },
  priceSecondary: {
    fontSize: t.bodySize,
    color: t.mutedForeground,
    marginBottom: 4,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: t.border,
    marginVertical: t.sectionGap / 2,
  },
  photoFrame: {
    borderRadius: t.radius2xl,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.photoWell,
    overflow: "hidden",
    marginBottom: 12,
  },
  photoImage: {
    width: t.photoWidth,
    height: t.photoHeight,
  },
  photoPlaceholderFrame: {
    borderRadius: t.radius2xl,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.photoWell,
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  photoPlaceholderText: {
    fontSize: t.bodySize,
    color: t.mutedForeground,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: t.headingSize,
    fontWeight: 600,
    letterSpacing: -0.2,
    color: t.foreground,
    marginBottom: 12,
  },
  bodyMuted: {
    fontSize: t.bodySize,
    lineHeight: 1.55,
    color: t.mutedForeground,
    marginBottom: 6,
  },
  contactLine: {
    fontSize: t.bodySize,
    color: t.foreground,
    marginBottom: 6,
  },
  contactLabel: {
    fontWeight: 600,
  },
  specRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  specCard: {
    flex: 1,
    borderRadius: t.radius2xl,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.cardFill,
    padding: 14,
    marginRight: 6,
  },
  specCardLast: {
    flex: 1,
    borderRadius: t.radius2xl,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.cardFill,
    padding: 14,
    marginLeft: 6,
  },
  specCardTitle: {
    fontSize: t.bodySize,
    fontWeight: 600,
    color: t.foreground,
    marginBottom: 10,
  },
  specValue: {
    fontSize: t.bodySize,
    color: t.foreground,
    marginBottom: 8,
  },
  availabilityHint: {
    fontSize: t.bodySize,
    color: t.mutedForeground,
    marginBottom: 8,
  },
  availabilityRow: {
    fontSize: t.bodySize,
    color: t.foreground,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.muted,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  linkLine: {
    fontSize: t.bodySize,
    color: t.mutedForeground,
    marginTop: 16,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: t.padX,
    right: t.padX,
    fontSize: 8,
    color: t.mutedForeground,
    textAlign: "center",
  },
});
