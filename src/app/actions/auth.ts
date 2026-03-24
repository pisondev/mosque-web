"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // Tambahkan import ini

export async function createSession(token: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("mosque_session", token, {
    httpOnly: true,
    secure: true, // Paksa true karena kita menggunakan HTTPS via Cloudflare
    sameSite: "lax", // Tambahan penting agar cookie aman saat redirect
    maxAge: 60 * 60 * 24 * 3,
    path: "/",
  });

  // Eksekusi redirect langsung dari Server Action
  redirect("/dashboard");
}