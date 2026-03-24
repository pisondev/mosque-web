"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// PERBAIKAN 1: Gunakan API_INTERNAL_URL untuk komunikasi Server-to-Server
const BASE_URL = process.env.API_INTERNAL_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/v1`;

export async function setupTenantAction(formData: FormData) {
  const name = formData.get("name") as string;
  const subdomain = formData.get("subdomain") as string;

  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (!token) {
    return { error: "Sesi tidak valid atau telah berakhir." };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/setup`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, subdomain }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Menangkap error validasi dari Go Fiber
      return { error: data.message || "Gagal menyimpan data." };
    }

    // PERBAIKAN 2: Gunakan parameter "layout" agar sapu bersih
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan jaringan." };
  }
}