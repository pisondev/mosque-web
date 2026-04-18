import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerApiOrigin } from "@/lib/server-api";

const API_INTERNAL = getServerApiOrigin();

export async function proxyWithSession(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { status: "error", message: "Sesi tidak valid atau telah berakhir." },
        { status: 401 },
      ),
    };
  }

  try {
    const upstream = await fetch(`${API_INTERNAL}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      cache: init.cache || "no-store",
    });

    const body = await upstream.json().catch(() => null);
    return { upstream, body };
  } catch {
    return {
      errorResponse: NextResponse.json(
        { status: "error", message: "Terjadi kesalahan jaringan." },
        { status: 502 },
      ),
    };
  }
}
