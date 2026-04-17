import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerApiOrigin } from "@/lib/server-api";

const API_INTERNAL = getServerApiOrigin();

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (!token) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") || "header";

  // Forward the multipart body as-is to backend
  const formData = await request.formData();

  const upstreamUrl = `${API_INTERNAL}/api/v1/tenant/upload?kind=${kind}`;

  try {
    const res = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type; fetch sets it with boundary from FormData
      },
      body: formData,
    });

    const json = await res.json().catch(() => null);
    return NextResponse.json(json ?? { status: "error", message: "Upstream error" }, { status: res.status });
  } catch {
    return NextResponse.json({ status: "error", message: "Storage unavailable" }, { status: 502 });
  }
}
