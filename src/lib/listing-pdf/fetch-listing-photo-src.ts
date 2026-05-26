const FETCH_TIMEOUT_MS = 20_000;

/** Resolve remote photo URL to a data URI for reliable PDF embedding. */
export async function fetchListingPhotoDataUri(
  url: string,
): Promise<string | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(trimmed, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) return null;

    const contentType =
      res.headers.get("content-type")?.split(";")[0]?.trim() ?? "image/jpeg";
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function resolveListingPhotoSources(
  urls: string[],
): Promise<string[]> {
  const resolved = await Promise.all(
    urls.map((url) => fetchListingPhotoDataUri(url)),
  );
  return resolved.filter((s): s is string => Boolean(s));
}
