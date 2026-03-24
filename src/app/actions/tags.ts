"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/v1`;

// Fungsi Bantuan untuk mengambil token
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("mosque_session")?.value;
}

// 1. Mengambil Daftar Tag
export async function getTags() {
  const token = await getToken();
  if (!token) return { status: "error", message: "Unauthorized" };

  try {
    const res = await fetch(`${API_URL}/tenant/tags?page=1&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server" };
  }
}

// 2. Membuat Tag Baru
export async function createTag(formData: FormData) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };
  const name = formData.get("name") as string;
  const scope = formData.get("scope") as string;

  try {
    const res = await fetch(`${API_URL}/tenant/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, scope }),
    });

    const data = await res.json();
    if (!res.ok) return { error: data.message || "Gagal membuat tag" };

    // Refresh halaman agar tabel tag terbaru muncul
    revalidatePath("/dashboard/tags");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function updateTag(formData: FormData) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();

  try {
    const res = await fetch(`${API_URL}/tenant/tags/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) return { error: data?.message || "Gagal memperbarui tag" };

    revalidatePath("/dashboard/tags");
    revalidatePath("/dashboard/content/create");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function deleteTag(id: number) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };
  try {
    const res = await fetch(`${API_URL}/tenant/tags/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 409) return { error: "Tag masih digunakan pada artikel/event." };
      return { error: "Gagal menghapus tag" };
    }

    revalidatePath("/dashboard/tags");
    revalidatePath("/dashboard/content/create");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}
