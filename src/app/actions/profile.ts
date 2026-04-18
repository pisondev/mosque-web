"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServerApiOrigin } from "@/lib/server-api";

const BASE_URL = getServerApiOrigin();
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
    province?: string;
    city?: string;
    address_full?: string;
    phone_whatsapp?: string;
    email?: string;
    header_image_url?: string;
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
      unauthorized: true,
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

    if (tenantMeRes.status === 401 || tenantMeRes.status === 403) {
      return {
        error: "Sesi tidak valid atau telah berakhir.",
        unauthorized: true,
        data: null,
      };
    }

    if (!tenantMeRes.ok || tenantMeJson?.status !== "success" || !tenantMeJson?.data) {
      return {
        error: "Gagal memuat data tenant.",
        unauthorized: false,
        data: null,
      };
    }

    const profile = profileRes.ok && profileJson?.status === "success" ? profileJson.data : {};

    return {
      error: null,
      unauthorized: false,
      data: {
        official_name: profile?.official_name || tenantMeJson.data.name || "",
        kind: profile?.kind || "masjid",
        short_name: profile?.short_name || "",
        province: profile?.province || "",
        city: profile?.city || "",
        address_full: profile?.address_full || "",
        phone_whatsapp: profile?.phone_whatsapp || "",
        email: profile?.email || tenantMeJson.data.email || "",
        header_image_url: profile?.header_image_url || "",
        subdomain: tenantMeJson.data.subdomain || "",
      },
    };
  } catch {
    return {
      error: "Terjadi kesalahan jaringan.",
      unauthorized: false,
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
    province: String(formData.get("province") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    address_full: String(formData.get("address_full") || "").trim(),
    phone_whatsapp: String(formData.get("phone_whatsapp") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    header_image_url: String(formData.get("header_image_url") || "").trim(),
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
