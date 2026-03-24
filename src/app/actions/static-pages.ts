"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/v1`;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("mosque_session")?.value;
}

export async function getStaticPages() {
  const token = await getToken();
  if (!token) return { status: "error", message: "Unauthorized", data: [] };

  try {
    const res = await fetch(`${API_URL}/tenant/static-pages`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server", data: [] };
  }
}

export async function upsertStaticPage(slug: string, formData: FormData) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };

  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();

  try {
    const res = await fetch(`${API_URL}/tenant/static-pages/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        excerpt,
        content_markdown: content,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: data?.message || "Gagal menyimpan halaman statis" };
    }

    revalidatePath("/dashboard/static-pages");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}
