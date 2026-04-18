import { NextResponse } from "next/server";
import { proxyWithSession } from "@/lib/session-proxy";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const result = await proxyWithSession("/api/v1/tenant/subscription/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });

  if (result.errorResponse) {
    return result.errorResponse;
  }

  const { upstream, body } = result;
  return NextResponse.json(body, { status: upstream.status });
}
