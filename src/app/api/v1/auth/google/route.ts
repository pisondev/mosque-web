import { NextResponse } from "next/server";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://localhost:8080";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Format payload tidak valid" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${API_INTERNAL_URL}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = await upstream.text();
    let jsonBody: unknown = null;

    try {
      jsonBody = JSON.parse(body);
    } catch {
      jsonBody = { status: "error", message: "Respon backend tidak valid" };
    }

    return NextResponse.json(jsonBody, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Tidak dapat terhubung ke layanan autentikasi" },
      { status: 502 }
    );
  }
}
