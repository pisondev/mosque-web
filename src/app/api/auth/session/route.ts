import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (!token) {
    return NextResponse.json({ status: "error", message: "Sesi belum tersedia." }, { status: 401 });
  }

  return NextResponse.json({ status: "success", ready: true });
}
