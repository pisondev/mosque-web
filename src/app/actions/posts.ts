"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = "http://localhost:8080/api/v1";

type PostPayload = {
  title: string;
  category: string;
  excerpt: string;
  content_markdown: string;
  status: string;
  tag_ids: number[];
  published_at?: string;
};

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("mosque_session")?.value;
}

// 1. Ambil Semua Artikel
export async function getPosts() {
  const token = await getToken();
  if (!token) return { status: "error", message: "Unauthorized" };

  try {
    const res = await fetch(`${API_URL}/tenant/posts?page=1&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server" };
  }
}

export async function getPostDetail(id: string) {
  const token = await getToken();
  if (!token) return { status: "error", message: "Unauthorized" };

  try {
    const res = await fetch(`${API_URL}/tenant/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server" };
  }
}

export async function deletePost(id: string) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };
  try {
    const res = await fetch(`${API_URL}/tenant/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return { error: "Gagal menghapus artikel" };

    revalidatePath("/dashboard/content");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function togglePostStatus(id: string, newStatus: string) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };
  try {
    const res = await fetch(`${API_URL}/tenant/posts/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) return { error: "Gagal mengubah status" };

    revalidatePath("/dashboard/content");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

function buildPayload(formData: FormData): PostPayload {
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const status = String(formData.get("status") || "draft").trim();
  const category = String(formData.get("category") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const tagIdRaw = formData.get("tag_id");
  const tagId = tagIdRaw ? Number(tagIdRaw) : null;

  const payload: PostPayload = {
    title,
    content_markdown: content,
    excerpt,
    status,
    category,
    tag_ids: tagId ? [tagId] : [],
  };

  if (status === "published") {
    payload.published_at = new Date().toISOString();
  }
  return payload;
}

export async function createPost(formData: FormData) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = buildPayload(formData);

  try {
    const res = await fetch(`${API_URL}/tenant/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const detail = data.errors ? JSON.stringify(data.errors) : data.message;
      return { error: `Validasi Gagal: ${detail}` };
    }

    revalidatePath("/dashboard/content");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function updatePost(id: string, formData: FormData) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };
  const payload = buildPayload(formData);

  try {
    const res = await fetch(`${API_URL}/tenant/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const detail = data?.errors ? JSON.stringify(data.errors) : data?.message;
      return { error: `Validasi Gagal: ${detail || "request ditolak"}` };
    }

    revalidatePath("/dashboard/content");
    revalidatePath(`/dashboard/content/${id}/edit`);
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}
