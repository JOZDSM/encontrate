import { NextResponse } from "next/server";

function sanitizeDbUrl(raw: string | undefined) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    // Never expose password.
    u.password = "";
    return {
      protocol: u.protocol,
      username: u.username,
      host: u.host,
      hostname: u.hostname,
      port: u.port,
      database: u.pathname.replace(/^\//, ""),
      search: u.search,
    };
  } catch {
    return { invalid: true };
  }
}

export async function GET() {
  // This endpoint is intentionally safe: it never returns secrets.
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  return NextResponse.json({
    has_DATABASE_URL: Boolean(databaseUrl),
    has_DIRECT_URL: Boolean(directUrl),
    DATABASE_URL: sanitizeDbUrl(databaseUrl),
    DIRECT_URL: sanitizeDbUrl(directUrl),
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}

