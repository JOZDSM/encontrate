import sanitizeHtml from "sanitize-html";

/** Visible character count for TipTap HTML or legacy plain text (validation). */
export function listingDescriptionPlainTextLength(raw: string): number {
  const t = raw.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ");
  return t.replace(/\s+/g, " ").trim().length;
}

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "b", "i", "ul", "ol", "li"],
  allowedAttributes: {},
};

/** Persisted / displayed HTML — strip scripts and unexpected tags (Node-safe, no jsdom). */
export function sanitizeListingDescriptionHtml(dirty: string): string {
  return sanitizeHtml(dirty.trim(), SANITIZE_OPTS);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * True when the string is almost certainly TipTap / HTML output rather than a single line of legacy copy.
 */
function looksLikeRichHtml(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return /^<[a-z]/i.test(t) || /<(p|ul|ol|li|strong|em|br)\b/i.test(t);
}

/** HTML safe to inject for the public listing page (legacy plain text wrapped as paragraphs / breaks). */
export function listingDescriptionDisplayHtml(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (looksLikeRichHtml(s)) {
    return sanitizeListingDescriptionHtml(s);
  }
  const inner = escapeHtml(s).replace(/\n/g, "<br />");
  return sanitizeListingDescriptionHtml(`<p>${inner}</p>`);
}

/** Search cards / snippets — no tags. */
export function stripHtmlForSnippet(htmlOrPlain: string): string {
  if (!htmlOrPlain) return "";
  return htmlOrPlain
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
