const FALLBACK_ORIGINS = [
  "http://127.0.0.1:8081",
  "http://localhost:8081",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
];

export function getServerApiOrigin() {
  const configured = [process.env.API_INTERNAL_URL, process.env.NEXT_PUBLIC_API_URL]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .flatMap((value) => expandOriginCandidates(value.trim().replace(/\/$/, "")));

  return [...new Set([...configured, ...FALLBACK_ORIGINS])][0];
}

function expandOriginCandidates(origin: string) {
  const candidates = [origin];

  try {
    const url = new URL(origin);
    if (url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
      candidates.unshift(url.toString().replace(/\/$/, ""));
    }
  } catch {
    // Keep original candidate if env value is malformed.
  }

  return candidates;
}
