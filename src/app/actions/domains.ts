"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = "http://localhost:8080/api/v1";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("mosque_session")?.value;
}

export async function getDomains() {
  const token = await getToken();
  if (!token) {
    return { status: "error", message: "Unauthorized", data: [] };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/domains?page=1&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return { status: "error", message: "Gagal memuat domain", data: [] };
    }

    return res.json();
  } catch {
    return { status: "error", message: "Gagal terhubung ke server", data: [] };
  }
}

export async function createDomain(formData: FormData) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };

  const hostname = String(formData.get("hostname") || "").trim();
  const domainType = String(formData.get("domain_type") || "").trim();

  try {
    const res = await fetch(`${API_URL}/tenant/domains`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hostname,
        domain_type: domainType,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: data?.message || "Gagal menambahkan domain" };
    }

    revalidatePath("/dashboard/domains");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function updateDomainStatus(id: number, status: string) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };

  try {
    const res = await fetch(`${API_URL}/tenant/domains/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: data?.message || "Gagal memperbarui status domain" };
    }

    revalidatePath("/dashboard/domains");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}

export async function deleteDomain(id: number) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };

  try {
    const res = await fetch(`${API_URL}/tenant/domains/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return { error: "Gagal menghapus domain" };
    }

    revalidatePath("/dashboard/domains");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}
