import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  
  // 1. Hancurkan sumber masalahnya (cookie yang sudah kedaluwarsa/tidak valid)
  cookieStore.delete("mosque_session");

  // 2. Arahkan kembali pengguna ke halaman login dengan selamat
  return NextResponse.redirect(new URL("/", request.url));
}