export function getPublicSiteUrl() {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) return origin;
  }
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://puffi.site";
}

export function getRequestOrigin(request: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost && !forwardedHost.includes("localhost")) {
    return `${proto}://${forwardedHost}`;
  }

  const origin = new URL(request.url).origin;
  if (!origin.includes("localhost")) return origin;
  return "https://puffi.site";
}
