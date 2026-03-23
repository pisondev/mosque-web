"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Konstanta base URL Go Fiber
const API_URL = "http://localhost:8080/api/v1";

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

    // Refresh halaman dashboard agar data baru (bukan "Toko Baru" lagi) termuat
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan jaringan." };
  }
}