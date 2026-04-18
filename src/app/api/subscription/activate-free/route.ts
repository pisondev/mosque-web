import { NextResponse } from "next/server";
import { proxyWithSession } from "@/lib/session-proxy";

export async function POST() {
  const result = await proxyWithSession("/api/v1/tenant/subscription/activate-free", {
    method: "POST",
  });

  if (result.errorResponse) {
    return result.errorResponse;
  }

  const { upstream, body } = result;
  return NextResponse.json(body, { status: upstream.status });
}
