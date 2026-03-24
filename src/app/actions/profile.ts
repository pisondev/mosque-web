"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// PERBAIKAN 1: Gunakan API_INTERNAL_URL
const BASE_URL = process.env.API_INTERNAL_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/v1`;

type TenantMeResponse = {
  status: string;
  data?: {
    name?: string;
    email?: string;
    subdomain?: string;
  };
};

type ProfileResponse = {
  status: string;
  data?: {
    official_name?: string;
    kind?: string;
    short_name?: string;
    city?: string;
    address_full?: string;
    phone_whatsapp?: string;
    email?: string;
  };
};

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("mosque_session")?.value;
}

export async function getProfileFormData() {
  const token = await getToken();
  if (!token) {
    return {
      error: "Sesi tidak valid atau telah berakhir.",
      data: null,
    };
  }

  try {
    const [tenantMeRes, profileRes] = await Promise.all([
      fetch(`${API_URL}/tenant/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${API_URL}/tenant/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    const tenantMeJson = (await tenantMeRes.json().catch(() => null)) as TenantMeResponse | null;
    const profileJson = (await profileRes.json().catch(() => null)) as ProfileResponse | null;

    if (!tenantMeRes.ok || tenantMeJson?.status !== "success" || !tenantMeJson?.data) {
      return {
        error: "Gagal memuat data tenant.",
        data: null,
      };
    }

    const profile = profileRes.ok && profileJson?.status === "success" ? profileJson.data : {};

    return {
      error: null,
      data: {
        official_name: profile?.official_name || tenantMeJson.data.name || "",
        kind: profile?.kind || "masjid",
        short_name: profile?.short_name || "",
        city: profile?.city || "",
        address_full: profile?.address_full || "",
        phone_whatsapp: profile?.phone_whatsapp || "",
        email: profile?.email || tenantMeJson.data.email || "",
        subdomain: tenantMeJson.data.subdomain || "",
      },
    };
  } catch {
    return {
      error: "Terjadi kesalahan jaringan.",
      data: null,
    };
  }
}

export async function upsertProfileAction(formData: FormData) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };

  const payload = {
    official_name: String(formData.get("official_name") || "").trim(),
    kind: String(formData.get("kind") || "").trim(),
    short_name: String(formData.get("short_name") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    address_full: String(formData.get("address_full") || "").trim(),
    phone_whatsapp: String(formData.get("phone_whatsapp") || "").trim(),
    email: String(formData.get("email") || "").trim(),
  };

  try {
    const res = await fetch(`${API_URL}/tenant/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: data?.message || "Gagal menyimpan profil masjid" };
    }

    // 👇 INI PERBAIKANNYA: Gunakan "layout" untuk menyapu bersih cache
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan" };
  }
}
