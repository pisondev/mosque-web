import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provinsi } = body as { provinsi?: string };
    if (!provinsi) {
      return NextResponse.json(
        { code: 400, message: "provinsi wajib diisi", data: [] },
        { status: 400 }
      );
    }

    const res = await fetch("https://equran.id/api/v2/shalat/kabkota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provinsi }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error("upstream error");
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json(
      { code: 500, message: "Gagal mengambil data kabupaten/kota", data: [] },
      { status: 502 }
    );
  }
}
