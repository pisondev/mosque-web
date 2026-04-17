const DEV_APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";
const PUBLIC_BASE_DOMAIN = process.env.NEXT_PUBLIC_PUBLIC_BASE_DOMAIN || "etakmir.id";

export function getPublicPortalUrl(subdomain: string) {
  const normalized = normalizeSubdomain(subdomain);
  if (!normalized) return "";

  if (isLocalEnvironment()) {
    return `${DEV_APP_ORIGIN.replace(/\/$/, "")}/${normalized}`;
  }

  return `https://${normalized}.${PUBLIC_BASE_DOMAIN}`;
}

export function getPublicPortalDisplay(subdomain: string) {
  const normalized = normalizeSubdomain(subdomain);
  if (!normalized) return "";

  if (isLocalEnvironment()) {
    const origin = stripProtocol(DEV_APP_ORIGIN).replace(/\/$/, "");
    return `${origin}/${normalized}`;
  }

  return `${normalized}.${PUBLIC_BASE_DOMAIN}`;
}

export function getPublicPortalPatternExample() {
  if (isLocalEnvironment()) {
    return `${stripProtocol(DEV_APP_ORIGIN).replace(/\/$/, "")}/nama-masjid`;
  }

  return `nama-masjid.${PUBLIC_BASE_DOMAIN}`;
}

export function getSubdomainInputSuffix() {
  return isLocalEnvironment() ? "-> localhost preview" : `.${PUBLIC_BASE_DOMAIN}`;
}

function isLocalEnvironment() {
  return process.env.NODE_ENV !== "production";
}

function normalizeSubdomain(value: string) {
  return value.trim().toLowerCase();
}

function stripProtocol(value: string) {
  return value.replace(/^https?:\/\//, "");
}
