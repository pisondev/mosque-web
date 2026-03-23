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
// 1. MODULE: EVENTS
// ==========================================

export async function listEvents(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/events?page=${page}&limit=${limit}`, {
      headers,
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server", data: [] };
  }
}

export async function createEvent(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  
  try {
    const res = await fetch(`${API_URL}/tenant/events`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal menambah event" };
    revalidatePath("/dashboard/events");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function updateEvent(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id; // Hapus ID dari body karena ditaruh di URL params

  try {
    const res = await fetch(`${API_URL}/tenant/events/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal memperbarui event" };
    revalidatePath("/dashboard/events");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function updateEventStatus(id: number, status: string) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/events/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return { error: "Gagal memperbarui status event" };
    revalidatePath("/dashboard/events");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function deleteEvent(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/events/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) return { error: "Gagal menghapus event" };
    revalidatePath("/dashboard/events");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

// ==========================================
// 2. MODULE: GALLERY ALBUMS & ITEMS
// ==========================================

export async function listGalleryAlbums(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/gallery/albums?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    return res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function createGalleryAlbum(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/gallery/albums`, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal menambah album" };
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function updateGalleryAlbum(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/gallery/albums/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal memperbarui album" };
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function deleteGalleryAlbum(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/gallery/albums/${id}`, { method: "DELETE", headers });
    if (!res.ok) return { error: "Gagal menghapus album" };
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function listGalleryItems(page = 1, limit = 100) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/gallery/items?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    return res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function createGalleryItem(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/gallery/items`, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal menambah foto/video" };
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function updateGalleryItem(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/gallery/items/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal memperbarui foto/video" };
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function deleteGalleryItem(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/gallery/items/${id}`, { method: "DELETE", headers });
    if (!res.ok) return { error: "Gagal menghapus foto/video" };
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

// ==========================================
// 3. MODULE: MANAGEMENT MEMBERS (Pengurus)
// ==========================================

export async function listManagementMembers(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/management-members?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    return res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function createManagementMember(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/management-members`, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal menambah pengurus" };
    revalidatePath("/dashboard/management");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function deleteManagementMember(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/management-members/${id}`, { method: "DELETE", headers });
    if (!res.ok) return { error: "Gagal menghapus pengurus" };
    revalidatePath("/dashboard/management");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function updateManagementMember(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id; // Buang ID dari payload karena dipakai di URL

  try {
    const res = await fetch(`${API_URL}/tenant/management-members/${id}`, { 
      method: "PUT", 
      headers, 
      body: JSON.stringify(payload) 
    });
    if (!res.ok) return { error: "Gagal memperbarui data pengurus" };
    revalidatePath("/dashboard/management");
    return { success: true };
  } catch { 
    return { error: "Terjadi kesalahan jaringan" }; 
  }
}