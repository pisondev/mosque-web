"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = "http://localhost:8080/api/v1";

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
// 1. MODULE: DONATION CHANNELS
// ==========================================
export async function listDonationChannels(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/donation-channels?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    return res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function createDonationChannel(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/donation-channels`, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal menambah kanal donasi" };
    revalidatePath("/dashboard/donations");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function updateDonationChannel(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/donation-channels/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal memperbarui kanal donasi" };
    revalidatePath("/dashboard/donations");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function deleteDonationChannel(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/donation-channels/${id}`, { method: "DELETE", headers });
    if (!res.ok) return { error: "Gagal menghapus kanal donasi" };
    revalidatePath("/dashboard/donations");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

// (Fungsi untuk Social Links, External Links, dan Website Features akan kita tambahkan di sini nanti saat masuk ke modulnya agar kita fokus satu per satu).