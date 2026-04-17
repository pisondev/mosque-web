import { NextResponse } from "next/server";
import { setSessionCookie } from "./session";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://localhost:8080";

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
    const upstream = await fetch(`${API_INTERNAL_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const rawBody = await upstream.text();
    const body = parseResponseBody(rawBody);

    if (options.setSession && upstream.ok) {
      const token = extractAccessToken(body);
      if (!token) {
        return NextResponse.json(
          { status: "error", message: "Token sesi backend tidak ditemukan" },
          { status: 502 },
        );
      }

      return setSessionCookie(NextResponse.json(body, { status: upstream.status }), token);
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Tidak dapat terhubung ke layanan autentikasi" },
      { status: 502 },
    );
  }
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
