function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/** Plain text for PDF — keeps paragraph breaks from simple HTML. */
export function listingDescriptionPlainText(raw: string): string {
  const s = raw.trim();
  if (!s) return "";

  if (!/<[a-z]/i.test(s)) {
    return decodeBasicEntities(s.replace(/\r\n/g, "\n")).trim();
  }

  const withBreaks = s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/li>\s*/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ");

  const withoutTags = withBreaks.replace(/<[^>]*>/g, "");
  return decodeBasicEntities(withoutTags)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
