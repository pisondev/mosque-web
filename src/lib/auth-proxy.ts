import { NextResponse } from "next/server";
import { getServerApiOrigin } from "./server-api";
import { setSessionCookie } from "./session";

const AUTH_PROXY_TIMEOUT_MS = 15000;

type ProxyOptions = {
  setSession?: boolean;
};

export async function proxyAuthRequest(
  request: Request,
  path: string,
  options: ProxyOptions = {},
) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Format payload tidak valid" },
      { status: 400 },
    );
  }

  try {
    const upstreamResult = await proxyToFirstReachableOrigin(path, payload);

    if (!upstreamResult) {
      const message = process.env.NODE_ENV === "development"
        ? "Tidak dapat terhubung ke layanan autentikasi. Periksa API_INTERNAL_URL atau backend localhost:8081."
        : "Tidak dapat terhubung ke layanan autentikasi";

      return NextResponse.json(
        { status: "error", message },
        { status: 502 },
      );
    }

    const { upstream, body, upstreamUrl } = upstreamResult;

    if (options.setSession && upstream.ok) {
      const token = extractAccessToken(body);
      if (!token) {
        console.error("[auth-proxy] missing access token in upstream response", { path, upstreamUrl });
        return NextResponse.json(
          { status: "error", message: "Token sesi backend tidak ditemukan" },
          { status: 502 },
        );
      }

      return setSessionCookie(NextResponse.json(body, { status: upstream.status }), token);
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    console.error("[auth-proxy] unexpected proxy failure", {
      path,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { status: "error", message: "Tidak dapat memproses proxy autentikasi" },
      { status: 502 },
    );
  }
}

async function proxyToFirstReachableOrigin(path: string, payload: unknown) {
  const origins = getCandidateOrigins();

  for (const origin of origins) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_PROXY_TIMEOUT_MS);
    const upstreamUrl = `${origin}${path}`;

    try {
      const upstream = await fetch(upstreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      });

      const rawBody = await upstream.text();
      const body = parseResponseBody(rawBody);
      return { upstream, body, upstreamUrl };
    } catch (error) {
      console.error("[auth-proxy] upstream request failed", {
        path,
        upstreamUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return null;
}

function getCandidateOrigins() {
  return [getServerApiOrigin()];
}

function parseResponseBody(rawBody: string) {
  if (!rawBody) {
    return { status: "error", message: "Respon backend kosong" };
  }

  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return { status: "error", message: "Respon backend tidak valid" };
  }
}

function extractAccessToken(body: Record<string, unknown>) {
  const direct = body.access_token;
  if (typeof direct === "string" && direct) {
    return direct;
  }

  const nested = body.data;
  if (!nested || typeof nested !== "object") {
    return "";
  }

  const token = (nested as Record<string, unknown>).access_token;
  return typeof token === "string" ? token : "";
}
