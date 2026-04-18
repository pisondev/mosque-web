"use server";

import { cookies } from "next/headers";
import { getServerApiOrigin } from "@/lib/server-api";

const BASE_URL = getServerApiOrigin();
const API_URL = `${BASE_URL}/api/v1`;

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
