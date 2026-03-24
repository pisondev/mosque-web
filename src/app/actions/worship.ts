"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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

export async function getPrayerSettings() {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: null };
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-time-settings`, {
      headers,
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server", data: null };
  }
}

export async function updatePrayerSettings(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-time-settings`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal menyimpan pengaturan waktu salat" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function listPrayerTimes() {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-times-daily?page=1&limit=20`, {
      headers,
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server", data: [] };
  }
}

export async function createPrayerTime(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-times-daily`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal menambah jadwal harian" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function updatePrayerTime(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = JSON.parse(String(formData.get("payload") || "{}")) as Record<string, unknown>;
  const id = Number(payload.id || formData.get("id"));
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-times-daily/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal memperbarui jadwal harian" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function deletePrayerTime(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-times-daily/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) return { error: "Gagal menghapus jadwal harian" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function listPrayerDuties() {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-duties?page=1&limit=20`, {
      headers,
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server", data: [] };
  }
}

export async function createPrayerDuty(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-duties`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal menambah petugas ibadah" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function updatePrayerDuty(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = JSON.parse(String(formData.get("payload") || "{}")) as Record<string, unknown>;
  const id = Number(payload.id || formData.get("id"));
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-duties/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal memperbarui petugas ibadah" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function deletePrayerDuty(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  try {
    const res = await fetch(`${API_URL}/tenant/prayer-duties/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) return { error: "Gagal menghapus petugas ibadah" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function listSpecialDays() {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/special-days?page=1&limit=20`, {
      headers,
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server", data: [] };
  }
}

export async function createSpecialDay(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/special-days`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal menambah hari besar" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function updateSpecialDay(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = JSON.parse(String(formData.get("payload") || "{}")) as Record<string, unknown>;
  const id = Number(payload.id || formData.get("id"));
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/special-days/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal memperbarui hari besar" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function deleteSpecialDay(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid atau telah berakhir." };
  try {
    const res = await fetch(`${API_URL}/tenant/special-days/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) return { error: "Gagal menghapus hari besar" };
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function getPrayerCalendar() {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: null };
  try {
    const from = new Date().toISOString().slice(0, 10);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 30);
    const to = toDate.toISOString().slice(0, 10);
    const res = await fetch(`${API_URL}/tenant/prayer-calendar?from=${from}&to=${to}`, {
      headers,
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server", data: null };
  }
}
