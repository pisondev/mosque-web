"use server";

import { cookies } from "next/headers";

// Fungsi ini akan dipanggil dari Client Component setelah mendapat JWT dari Go
export async function createSession(token: string) {
  const cookieStore = await cookies();
  
  // Simpan token ke dalam HTTP-Only Cookie
  cookieStore.set("mosque_session", token, {
    httpOnly: true, // Tidak bisa dibaca oleh JavaScript di browser
    secure: process.env.NODE_ENV === "production", // Wajib HTTPS di mode Production
    maxAge: 60 * 60 * 24 * 3, // Kedaluwarsa dalam 3 hari (sama seperti backend Go)
    path: "/", // Cookie berlaku untuk seluruh halaman aplikasi
  });

}