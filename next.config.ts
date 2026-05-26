import type { NextConfig } from "next";

const lanHosts = process.env.LAN_DEV_HOST?.split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/api/listings/[id]/pdf": [
      "./node_modules/@fontsource/figtree/files/**/*",
    ],
  },
  // Dev: allow opening the app via your LAN IP (e.g. Safari on another device).
  // Without this, Next can block /_next Webpack HMR WebSockets and some dev fetches.
  // Set LAN_DEV_HOST in .env (e.g. 192.168.0.10) or edit the fallback below.
  ...(process.env.NODE_ENV === "development"
    ? {
        allowedDevOrigins: lanHosts?.length ? lanHosts : ["192.168.0.13"],
      }
    : {}),
};

export default nextConfig;
