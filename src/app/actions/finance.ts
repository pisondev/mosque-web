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

// ==========================================
// 1. MODUL: STATIC PAYMENT METHODS
// ==========================================
export async function listStaticPaymentMethods(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    // Sudah menggunakan endpoint resmi dari backend
    const res = await fetch(`${API_URL}/tenant/static-payment-methods?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    if (!res.ok) return { status: "error", message: "Gagal memuat data", data: [] };
    return await res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function createStaticPaymentMethod(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/static-payment-methods`, { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal menambah rekening statis" };
    revalidatePath("/dashboard/finance/static-accounts");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function updateStaticPaymentMethod(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/static-payment-methods/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal memperbarui rekening statis" };
    revalidatePath("/dashboard/finance/static-accounts");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function deleteStaticPaymentMethod(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/static-payment-methods/${id}`, { method: "DELETE", headers });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal menghapus rekening statis" };
    revalidatePath("/dashboard/finance/static-accounts");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

// ==========================================
// 2. MODUL: PAYMENT GATEWAY CONFIG
// ==========================================
export async function getPgConfig() {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: null };
  try {
    const res = await fetch(`${API_URL}/tenant/pg-config`, { headers, cache: "no-store" });
    if (!res.ok) return { status: "error", message: "Gagal memuat konfigurasi PG", data: null };
    return await res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: null }; }
}

export async function updatePgConfig(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/pg-config`, { method: "PUT", headers, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal menyimpan konfigurasi PG" };
    revalidatePath("/dashboard/finance/settings");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

// ==========================================
// 3. MODUL: CAMPAIGNS & TRANSACTIONS
// ==========================================
export async function listCampaigns(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/campaigns?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    if (!res.ok) return { status: "error", message: "Gagal memuat kampanye", data: [] };
    return await res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function getCampaignById(id: string | number) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: null };
  try {
    const res = await fetch(`${API_URL}/tenant/campaigns/${id}`, { headers, cache: "no-store" });
    if (!res.ok) return { status: "error", message: "Gagal memuat detail kampanye", data: null };
    return await res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: null }; }
}

export async function createCampaign(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/campaigns`, { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal membuat program donasi" };
    revalidatePath("/dashboard/finance/campaigns");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function updateCampaign(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/campaigns/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal memperbarui program donasi" };
    revalidatePath("/dashboard/finance/campaigns");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function listCampaignTransactions(campaignId: string | number, page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/campaigns/${campaignId}/transactions?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    if (!res.ok) return { status: "error", message: "Gagal memuat transaksi", data: [] };
    return await res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}