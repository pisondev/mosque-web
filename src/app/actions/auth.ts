"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // Tambahkan import ini

export async function createSession(token: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("mosque_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 3,
    path: "/",
  });

  redirect("/dashboard");
}
