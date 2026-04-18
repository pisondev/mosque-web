"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServerApiOrigin } from "@/lib/server-api";

const API_URL = `${getServerApiOrigin()}/api/v1`;

export type AccountProfileData = {
  email: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  google_connected: boolean;
};

type AccountProfileResponse = {
  status?: string;
  data?: AccountProfileData;
  message?: string;
};

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("mosque_session")?.value;
}

export async function getAccountProfileAction() {
  const token = await getToken();
  if (!token) {
    return { error: "Sesi tidak valid atau telah berakhir.", unauthorized: true, data: null as AccountProfileData | null };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/account-profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as AccountProfileResponse | null;
    if (res.status === 401 || res.status === 403) {
      return { error: json?.message || "Sesi tidak valid atau telah berakhir.", unauthorized: true, data: null as AccountProfileData | null };
    }
    if (!res.ok || json?.status !== "success" || !json.data) {
      return { error: json?.message || "Gagal memuat profil akun.", unauthorized: false, data: null as AccountProfileData | null };
    }

    return { error: null, unauthorized: false, data: json.data };
  } catch {
    return { error: "Terjadi kesalahan jaringan.", unauthorized: false, data: null as AccountProfileData | null };
  }
}

export async function updateAccountProfileAction(formData: FormData) {
  const token = await getToken();
  if (!token) return { error: "Sesi tidak valid atau telah berakhir." };

  const avatarValue = String(formData.get("avatar_url") || "").trim();
  const payload = {
    display_name: String(formData.get("display_name") || "").trim(),
    avatar_url: avatarValue || null,
  };

  try {
    const res = await fetch(`${API_URL}/tenant/account-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => null)) as AccountProfileResponse | null;
    if (!res.ok) {
      return { error: json?.message || "Gagal menyimpan profil akun." };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/account");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan." };
  }
}
