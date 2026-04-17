import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerApiOrigin } from "@/lib/server-api";

const API_INTERNAL = getServerApiOrigin();

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (!token) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_INTERNAL}/api/v1/tenant/storage-quota`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return NextResponse.json(json ?? { status: "error", message: "Upstream error" }, { status: res.status });
  } catch {
    return NextResponse.json({ status: "error", message: "Storage unavailable" }, { status: 502 });
  }
}
