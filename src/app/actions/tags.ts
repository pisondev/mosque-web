"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = "http://localhost:8080/api/v1";

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
    const res = await fetch(`${API_URL}/tenant/tags`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.json();
  } catch (error) {
    return { status: "error", message: "Gagal terhubung ke server" };
  }
}

// 2. Membuat Tag Baru
export async function createTag(formData: FormData) {
  const token = await getToken();
  const name = formData.get("name") as string;
  const scope = formData.get("scope") as string; // misal: "post", "gallery", "event"

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
  } catch (error) {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

// 3. Menghapus Tag
export async function deleteTag(id: number) {
  const token = await getToken();
  try {
    const res = await fetch(`${API_URL}/tenant/tags/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        // Mengingat error "ErrTagInUse" yang kita buat di Go Fiber
        if (res.status === 409) return { error: "Tag masih digunakan pada artikel/event!" };
        return { error: "Gagal menghapus tag" };
    }

    revalidatePath("/dashboard/tags");
    return { success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan jaringan" };
  }
}