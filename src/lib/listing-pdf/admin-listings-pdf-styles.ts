import { StyleSheet } from "@react-pdf/renderer";
import { listingPdfTokens as t } from "@/lib/listing-pdf/listing-pdf-tokens";
import { listingPdfPageSize } from "@/lib/listing-pdf/listing-pdf-styles";

export { listingPdfPageSize as adminListingsPdfPageSize };

/** Light page — avoids a visible dark page edge in mobile PDF viewers. */
const pageColors = {
  background: "#ffffff",
  foreground: "#262626",
  mutedForeground: "#737373",
  border: "#e5e5e5",
};

const basePage = {
  backgroundColor: pageColors.background,
  color: pageColors.foreground,
  fontFamily: t.fontFamily,
  fontSize: t.bodySize,
  paddingTop: 16,
  paddingBottom: 16,
  paddingHorizontal: t.padX,
};

export const adminListingsPdfStyles = StyleSheet.create({
  page: {
    ...basePage,
    borderWidth: 0,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: -0.2,
    color: pageColors.foreground,
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: t.captionSize,
    color: pageColors.mutedForeground,
    marginBottom: 14,
  },
  item: {
    marginBottom: 2,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: t.secondary,
    borderRadius: t.radiusPill,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 600,
    color: t.secondaryForeground,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: -0.15,
    color: pageColors.foreground,
    marginBottom: 3,
  },
  characteristics: {
    fontSize: 9,
    lineHeight: 1.35,
    color: pageColors.mutedForeground,
    marginBottom: 2,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: pageColors.border,
    marginTop: 6,
    marginBottom: 6,
  },
});
