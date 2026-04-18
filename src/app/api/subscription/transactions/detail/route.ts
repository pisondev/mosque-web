import { NextResponse } from "next/server";
import { proxyWithSession } from "@/lib/session-proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const transactionId = url.searchParams.get("transactionId") || "";

  if (!transactionId) {
    return NextResponse.json({ status: "error", message: "transactionId wajib diisi." }, { status: 400 });
  }

  const result = await proxyWithSession(`/api/v1/tenant/subscription/transactions/${transactionId}`);

  if (result.errorResponse) {
    return result.errorResponse;
  }

  const { upstream, body } = result;
  return NextResponse.json(body, { status: upstream.status });
}
