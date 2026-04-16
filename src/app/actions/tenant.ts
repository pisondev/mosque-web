"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// PERBAIKAN 1: Gunakan API_INTERNAL_URL untuk komunikasi Server-to-Server
const BASE_URL = process.env.API_INTERNAL_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/v1`;

export async function setupTenantAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const rawSubdomain = String(formData.get("subdomain") || "");
  const subdomain = rawSubdomain.trim().toLowerCase();

  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (!token) {
    return { error: "Sesi tidak valid atau telah berakhir." };
  }

  if (!name) {
    return { error: "Nama resmi wajib diisi." };
  }

  if (!/^[a-z-]{1,10}$/.test(subdomain)) {
    return { error: "Subdomain hanya boleh huruf kecil (a-z) dan strip (-), maksimal 10 karakter." };
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
      const firstFieldError = Array.isArray(data?.errors) ? data.errors[0]?.message : null;
      return { error: firstFieldError || data?.message || "Gagal menyimpan data." };
    }

    // PERBAIKAN 2: Gunakan parameter "layout" agar sapu bersih
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan." };
  }
}

// ==========================================
// MENGAMBIL STATUS BILLING & FITUR SAAS
// ==========================================
export async function getBillingStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (!token) {
    return { status: "error", message: "Sesi tidak valid.", data: null };
  }

  try {
    // Memanggil API asli yang sudah disiapkan backend
    const res = await fetch(`${API_URL}/tenant/billing-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Wajib no-store agar status paket selalu up-to-date
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return { status: "error", message: errorData?.message || "Gagal mengambil data billing", data: null };
    }

    return await res.json();
  } catch {
    return { status: "error", message: "Terjadi kesalahan jaringan.", data: null };
  }
}
