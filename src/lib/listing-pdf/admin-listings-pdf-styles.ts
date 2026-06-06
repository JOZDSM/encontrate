import { StyleSheet } from "@react-pdf/renderer";
import { listingPdfTokens as t } from "@/lib/listing-pdf/listing-pdf-tokens";
import { listingPdfPageSize } from "@/lib/listing-pdf/listing-pdf-styles";

export { listingPdfPageSize as adminListingsPdfPageSize };

const basePage = {
  backgroundColor: t.background,
  color: t.foreground,
  fontFamily: t.fontFamily,
  fontSize: t.bodySize,
  paddingTop: 16,
  paddingBottom: 28,
  paddingHorizontal: t.padX,
};

export const adminListingsPdfStyles = StyleSheet.create({
  page: {
    ...basePage,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: -0.2,
    color: t.foreground,
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: t.captionSize,
    color: t.mutedForeground,
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
    color: t.foreground,
    marginBottom: 3,
  },
  characteristics: {
    fontSize: 9,
    lineHeight: 1.35,
    color: t.mutedForeground,
    marginBottom: 2,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: t.border,
    marginTop: 6,
    marginBottom: 6,
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
