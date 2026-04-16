import { NextResponse } from "next/server";

export const revalidate = 86400; // cache 24 jam

export async function GET() {
  try {
    const res = await fetch("https://equran.id/api/v2/shalat/provinsi", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("upstream error");
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json(
      { code: 500, message: "Gagal mengambil data provinsi", data: [] },
      { status: 502 }
    );
  }
}
