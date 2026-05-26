import { StyleSheet } from "@react-pdf/renderer";

/** Portrait page size (pt), iPhone-ish width at 72 dpi. */
export const LISTING_PDF_PAGE_WIDTH = 390;
export const LISTING_PDF_PAGE_HEIGHT = 844;

export const listingPdfPageSize: [number, number] = [
  LISTING_PDF_PAGE_WIDTH,
  LISTING_PDF_PAGE_HEIGHT,
];

export const listingPdfStyles = StyleSheet.create({
  coverPage: {
    padding: 28,
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  neighborhood: {
    fontSize: 11,
    color: "#525252",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    lineHeight: 1.25,
  },
  pricePrimary: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  priceSecondary: {
    fontSize: 12,
    color: "#525252",
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: "#525252",
    marginTop: 4,
  },
  photoPage: {
    width: LISTING_PDF_PAGE_WIDTH,
    height: LISTING_PDF_PAGE_HEIGHT,
    backgroundColor: "#f5f5f5",
  },
  photoImage: {
    width: LISTING_PDF_PAGE_WIDTH,
    height: LISTING_PDF_PAGE_HEIGHT,
    objectFit: "cover",
  },
  placeholderPage: {
    width: LISTING_PDF_PAGE_WIDTH,
    height: LISTING_PDF_PAGE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  placeholderText: {
    fontSize: 12,
    color: "#737373",
    fontFamily: "Helvetica",
  },
  textPage: {
    padding: 28,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.45,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitleFirst: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 0,
    marginBottom: 8,
  },
  body: {
    fontSize: 11,
    color: "#404040",
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 11,
    marginBottom: 4,
  },
  contactLabel: {
    fontFamily: "Helvetica-Bold",
  },
  specGroupTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 6,
  },
  specLine: {
    fontSize: 11,
    color: "#404040",
    marginBottom: 4,
    paddingLeft: 4,
  },
  availabilityLine: {
    fontSize: 11,
    color: "#404040",
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 28,
    right: 28,
    fontSize: 9,
    color: "#737373",
  },
});
