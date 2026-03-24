"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.API_INTERNAL_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/v1`;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("mosque_session")?.value;
}

async function authHeaders() {
  const token = await getToken();
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// // ==========================================
// // MODUL: STATIC PAYMENT METHODS (Rekening & QRIS)
// // ==========================================
// export async function listStaticPaymentMethods(page = 1, limit = 50) {
//   const headers = await authHeaders();
//   if (!headers) return { status: "error", message: "Unauthorized", data: [] };
//   try {
//     const res = await fetch(`${API_URL}/tenant/static-payment-methods?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
//     return res.json();
//   } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
// }

// export async function createStaticPaymentMethod(formData: FormData) {
//   const headers = await authHeaders();
//   if (!headers) return { error: "Sesi tidak valid." };
//   const payload = JSON.parse(String(formData.get("payload") || "{}"));
//   try {
//     const res = await fetch(`${API_URL}/tenant/static-payment-methods`, { method: "POST", headers, body: JSON.stringify(payload) });
//     const data = await res.json();
//     if (!res.ok) return { error: data.message || "Gagal menambah rekening statis" };
//     revalidatePath("/dashboard/finance/static-accounts");
//     return { success: true };
//   } catch { return { error: "Terjadi kesalahan jaringan" }; }
// }

// export async function updateStaticPaymentMethod(formData: FormData) {
//   const headers = await authHeaders();
//   if (!headers) return { error: "Sesi tidak valid." };
//   const payload = JSON.parse(String(formData.get("payload") || "{}"));
//   const id = payload.id;
//   delete payload.id;
//   try {
//     const res = await fetch(`${API_URL}/tenant/static-payment-methods/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
//     const data = await res.json();
//     if (!res.ok) return { error: data.message || "Gagal memperbarui rekening statis" };
//     revalidatePath("/dashboard/finance/static-accounts");
//     return { success: true };
//   } catch { return { error: "Terjadi kesalahan jaringan" }; }
// }

// export async function deleteStaticPaymentMethod(id: number) {
//   const headers = await authHeaders();
//   if (!headers) return { error: "Sesi tidak valid." };
//   try {
//     const res = await fetch(`${API_URL}/tenant/static-payment-methods/${id}`, { method: "DELETE", headers });
//     if (!res.ok) return { error: "Gagal menghapus rekening statis" };
//     revalidatePath("/dashboard/finance/static-accounts");
//     return { success: true };
//   } catch { return { error: "Terjadi kesalahan jaringan" }; }
// }

// ==========================================
// MODUL: STATIC PAYMENT METHODS (Rekening & QRIS)
// ==========================================

// SEMENTARA: Gunakan 'donation-channels' sampai tim backend selesai merombak route-nya.
// Jika backend sudah update, kamu tinggal Replace 'donation-channels' menjadi 'static-payment-methods'.
const TEMP_ENDPOINT = "donation-channels"; 

export async function listStaticPaymentMethods(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  
  try {
    const res = await fetch(`${API_URL}/tenant/${TEMP_ENDPOINT}?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    
    // PENGAMAN: Mencegah error "Unexpected token C" jika backend membalas pesan teks/HTML (404 Not Found)
    if (!res.ok) {
      return { status: "error", message: "Gagal memuat atau endpoint belum siap", data: [] };
    }
    
    return await res.json();
  } catch { 
    return { status: "error", message: "Gagal terhubung", data: [] }; 
  }
}

export async function createStaticPaymentMethod(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/${TEMP_ENDPOINT}`, { method: "POST", headers, body: JSON.stringify(payload) });
    
    if (!res.ok) {
      // Coba parse JSON, kalau gagal berarti error dari Nginx/Fiber (bukan JSON)
      const data = await res.json().catch(() => null);
      return { error: data?.message || "Gagal menambah rekening statis" };
    }

    revalidatePath("/dashboard/finance/static-accounts");
    return { success: true };
  } catch { 
    return { error: "Terjadi kesalahan jaringan" }; 
  }
}

export async function updateStaticPaymentMethod(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id;
  
  try {
    const res = await fetch(`${API_URL}/tenant/${TEMP_ENDPOINT}/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.message || "Gagal memperbarui rekening statis" };
    }

    revalidatePath("/dashboard/finance/static-accounts");
    return { success: true };
  } catch { 
    return { error: "Terjadi kesalahan jaringan" }; 
  }
}

export async function deleteStaticPaymentMethod(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  
  try {
    const res = await fetch(`${API_URL}/tenant/${TEMP_ENDPOINT}/${id}`, { method: "DELETE", headers });
    
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.message || "Gagal menghapus rekening statis" };
    }

    revalidatePath("/dashboard/finance/static-accounts");
    return { success: true };
  } catch { 
    return { error: "Terjadi kesalahan jaringan" }; 
  }
}