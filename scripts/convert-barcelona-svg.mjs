// One-shot converter: public/maps/barcelona-zones.svg -> src/components/barcelona-zone-svg.tsx
// Re-run after re-exporting from Figma. Safe to delete after a successful conversion.

import { readFileSync, writeFileSync } from "node:fs";

const SLUGS = [
  "ciutatvella",
  "eixample",
  "gracia",
  "sarriasantgervasi",
  "lescorts",
  "sants",
  "horta",
  "noubarris",
  "santandreu",
  "santmarti",
];

function extractZoneInner(svgText, slug) {
  const startTag = `<g id="${slug}">`;
  const startIdx = svgText.indexOf(startTag);
  if (startIdx === -1) throw new Error(`Missing zone in SVG: ${slug}`);
  let i = startIdx + startTag.length;
  let depth = 1;
  while (depth > 0 && i < svgText.length) {
    const open = svgText.indexOf("<g", i);
    const close = svgText.indexOf("</g>", i);
    if (close === -1) throw new Error(`Unclosed <g> for ${slug}`);
    if (open !== -1 && open < close) {
      depth++;
      i = open + 2;
    } else {
      depth--;
      i = close + 4;
    }
  }
  return svgText.slice(startIdx + startTag.length, i - 4);
}

function transformZoneInner(inner, slug) {
  let out = inner;

  // Strip inline fill/stroke from every <path> EXCEPT those nested inside <mask>...</mask>.
  // Figma compound shapes export as several <path> elements (one per disjoint piece) plus
  // a final masked outline path; all of them carry inline fill="#262626" / stroke="#404040"
  // and need to be CSS-driven for state swaps. Paths inside <mask> inherit fill="white" from
  // the parent <mask fill="white"> and have no inline fill/stroke attributes, so a simple
  // mask-boundary scan is enough.
  const segments = [];
  let cursor = 0;
  while (cursor < out.length) {
    const maskOpen = out.indexOf("<mask", cursor);
    if (maskOpen === -1) {
      segments.push({ text: out.slice(cursor), insideMask: false });
      break;
    }
    if (maskOpen > cursor) {
      segments.push({ text: out.slice(cursor, maskOpen), insideMask: false });
    }
    const maskClose = out.indexOf("</mask>", maskOpen);
    if (maskClose === -1) throw new Error(`Unclosed <mask> in ${slug}`);
    const end = maskClose + "</mask>".length;
    segments.push({ text: out.slice(maskOpen, end), insideMask: true });
    cursor = end;
  }
  out = segments
    .map((seg) => {
      if (seg.insideMask) return seg.text;
      return seg.text
        .replace(/<path([^>]*?)\/>/g, (_m, attrs) => {
          const cleaned = attrs
            .replace(/\sfill="[^"]*"/g, "")
            .replace(/\sstroke="[^"]*"/g, "");
          return `<path${cleaned}/>`;
        })
        .replace(/<text([^>]*?)>/g, (_m, attrs) => {
          const cleaned = attrs.replace(/\sfill="[^"]*"/g, "");
          return `<text${cleaned}>`;
        });
    })
    .join("");

  // Fix the typo in the only label that has one.
  if (slug === "sarriasantgervasi") {
    out = out.replace(">Gervais<", ">Gervasi<");
  }

  // SVG attribute casing -> JSX casing.
  out = out
    .replace(/\bstroke-width=/g, "strokeWidth=")
    .replace(/\bstroke-linejoin=/g, "strokeLinejoin=")
    .replace(/\bfont-family=/g, "fontFamily=")
    .replace(/\bfont-size=/g, "fontSize=")
    .replace(/\bletter-spacing=/g, "letterSpacing=")
    .replace(/\bxml:space=/g, "xmlSpace=")
    .replace(/\bclip-path=/g, "clipPath=")
    .replace(/\bfill-rule=/g, "fillRule=")
    .replace(/\bclip-rule=/g, "clipRule=");

  // Inline style strings -> JSX object form. The only one Figma emits here is white-space:pre.
  out = out.replace(
    /style="white-space:\s*pre"/g,
    'style={{ whiteSpace: "pre" }}',
  );

  return out.trim();
}

const svg = readFileSync("public/maps/barcelona-zones.svg", "utf8");
const zones = {};
for (const slug of SLUGS) {
  zones[slug] = transformZoneInner(extractZoneInner(svg, slug), slug);
}

let body = "";
for (const slug of SLUGS) {
  body += `      {renderZone("${slug}", (\n        <>\n${zones[slug]}\n        </>\n      ))}\n`;
}

const tsx = `"use client";

/**
 * Auto-generated from public/maps/barcelona-zones.svg.
 * To update: re-export from Figma, replace the SVG, and re-run
 *   node scripts/convert-barcelona-svg.mjs
 *
 * Notes baked into this conversion:
 * - The dark-mode background <rect> at the SVG root is excluded.
 * - Inline fill/stroke on the visible neighborhood paths (the ones with
 *   mask="url(...)") is stripped so .barcelona-zone-group rules in
 *   src/app/globals.css can drive the unselected/selected/hover states.
 * - Inline fill on <text> labels is also stripped for the same reason.
 * - The Sarrià-Sant Gervasi label typo ("Gervais") is fixed on import.
 */

import type { ReactNode } from "react";
import { BARCELONA_ZONE_LABELS } from "@/lib/barcelona-zones";

type Slug = keyof typeof BARCELONA_ZONE_LABELS;

type Props = {
  selected: Set<string>;
  toggle: (slug: string) => void;
  titleId: string;
};

export function BarcelonaZoneSvg({ selected, toggle, titleId }: Props) {
  const renderZone = (slug: Slug, children: ReactNode) => {
    const isOn = selected.has(slug);
    return (
      <g
        key={slug}
        id={slug}
        className="barcelona-zone-group"
        role="button"
        tabIndex={0}
        aria-pressed={isOn}
        aria-label={BARCELONA_ZONE_LABELS[slug]}
        data-selected={isOn ? "true" : undefined}
        onClick={() => toggle(slug)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(slug);
          }
        }}
      >
        {children}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 440 412"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby={titleId}
      className="block h-auto w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>Mapa esquemático de barrios de Barcelona</title>
      <g id="map">
${body}      </g>
    </svg>
  );
}
`;

writeFileSync("src/components/barcelona-zone-svg.tsx", tsx, "utf8");
console.log(
  `Wrote src/components/barcelona-zone-svg.tsx (${tsx.length} chars, ${SLUGS.length} zones)`,
);
