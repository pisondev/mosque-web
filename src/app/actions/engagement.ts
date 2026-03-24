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

// ==========================================
// 2. MODULE: SOCIAL LINKS
// ==========================================
export async function listSocialLinks(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/social-links?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    return res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function createSocialLink(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/social-links`, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal menambah tautan sosial" };
    revalidatePath("/dashboard/links");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function updateSocialLink(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/social-links/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal memperbarui tautan sosial" };
    revalidatePath("/dashboard/links");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function deleteSocialLink(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/social-links/${id}`, { method: "DELETE", headers });
    if (!res.ok) return { error: "Gagal menghapus tautan sosial" };
    revalidatePath("/dashboard/links");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

// ==========================================
// 3. MODULE: EXTERNAL LINKS
// ==========================================
export async function listExternalLinks(page = 1, limit = 50) {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/external-links?page=${page}&limit=${limit}`, { headers, cache: "no-store" });
    return res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function createExternalLink(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  try {
    const res = await fetch(`${API_URL}/tenant/external-links`, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal menambah tautan eksternal" };
    revalidatePath("/dashboard/links");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function updateExternalLink(formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  const id = payload.id;
  delete payload.id;
  try {
    const res = await fetch(`${API_URL}/tenant/external-links/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    if (!res.ok) return { error: "Gagal memperbarui tautan eksternal" };
    revalidatePath("/dashboard/links");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function deleteExternalLink(id: number) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/external-links/${id}`, { method: "DELETE", headers });
    if (!res.ok) return { error: "Gagal menghapus tautan eksternal" };
    revalidatePath("/dashboard/links");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

// ==========================================
// 4. MODULE: WEBSITE FEATURES
// ==========================================
export async function listFeatureCatalog() {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/feature-catalog`, { headers, cache: "no-store" });
    return res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function listWebsiteFeatures() {
  const headers = await authHeaders();
  if (!headers) return { status: "error", message: "Unauthorized", data: [] };
  try {
    const res = await fetch(`${API_URL}/tenant/website-features`, { headers, cache: "no-store" });
    return res.json();
  } catch { return { status: "error", message: "Gagal terhubung", data: [] }; }
}

export async function updateWebsiteFeature(featureId: number, formData: FormData) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  const payload = JSON.parse(String(formData.get("payload") || "{}"));
  
  try {
    const res = await fetch(`${API_URL}/tenant/website-features/${featureId}`, { 
      method: "PUT", 
      headers, 
      body: JSON.stringify(payload) 
    });
    if (!res.ok) return { error: "Gagal memperbarui fitur website" };
    revalidatePath("/dashboard/features");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}

export async function bulkUpdateWebsiteFeatures(payload: any) {
  const headers = await authHeaders();
  if (!headers) return { error: "Sesi tidak valid." };
  try {
    const res = await fetch(`${API_URL}/tenant/website-features/bulk`, { 
      method: "PATCH", 
      headers, 
      body: JSON.stringify(payload) 
    });
    if (!res.ok) return { error: "Gagal memperbarui status secara massal" };
    revalidatePath("/dashboard/features");
    return { success: true };
  } catch { return { error: "Terjadi kesalahan jaringan" }; }
}