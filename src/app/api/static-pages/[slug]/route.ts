import { NextResponse } from "next/server";
import { proxyWithSession } from "@/lib/session-proxy";

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ status: "error", message: "Payload tidak valid." }, { status: 400 });
  }

  const result = await proxyWithSession(`/api/v1/tenant/static-pages/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, request);

  if (result.errorResponse) {
    return result.errorResponse;
  }

  const { upstream, body } = result;
  return NextResponse.json(body, { status: upstream.status });
}
