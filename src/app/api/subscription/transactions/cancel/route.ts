import { NextResponse } from "next/server";
import { proxyWithSession } from "@/lib/session-proxy";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { transaction_id?: string } | null;
  const transactionId = String(payload?.transaction_id || "").trim();

  if (!transactionId) {
    return NextResponse.json({ status: "error", message: "transaction_id wajib diisi." }, { status: 400 });
  }

  const result = await proxyWithSession(`/api/v1/tenant/subscription/transactions/${transactionId}/cancel`, {
    method: "POST",
  });

  if (result.errorResponse) {
    return result.errorResponse;
  }

  const { upstream, body } = result;
  return NextResponse.json(body, { status: upstream.status });
}
