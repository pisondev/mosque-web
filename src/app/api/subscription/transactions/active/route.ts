import { NextResponse } from "next/server";
import { proxyWithSession } from "@/lib/session-proxy";

export async function GET(request: Request) {
  const result = await proxyWithSession("/api/v1/tenant/subscription/transactions/active", {}, request);

  if (result.errorResponse) {
    return result.errorResponse;
  }

  const { upstream, body } = result;
  return NextResponse.json(body, { status: upstream.status });
}
