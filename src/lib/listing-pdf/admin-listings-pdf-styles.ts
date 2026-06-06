import { StyleSheet } from "@react-pdf/renderer";
import { listingPdfTokens as t } from "@/lib/listing-pdf/listing-pdf-tokens";
import {
  LISTING_PDF_PAGE_HEIGHT,
  LISTING_PDF_PAGE_WIDTH,
  listingPdfPageSize,
} from "@/lib/listing-pdf/listing-pdf-styles";

export { listingPdfPageSize as adminListingsPdfPageSize };

const basePage = {
  backgroundColor: "#ffffff",
  fontFamily: t.fontFamily,
  fontSize: t.bodySize,
  padding: 0,
};

export const adminListingsPdfStyles = StyleSheet.create({
  page: {
    ...basePage,
  },
  pageBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: LISTING_PDF_PAGE_WIDTH,
    height: LISTING_PDF_PAGE_HEIGHT,
    backgroundColor: t.background,
  },
  content: {
    color: t.foreground,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: t.padX,
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
});
