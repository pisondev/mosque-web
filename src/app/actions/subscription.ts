"use server";

import { cookies } from "next/headers";
import { getServerApiOrigin } from "@/lib/server-api";

const BASE_URL = getServerApiOrigin();
const API_URL = `${BASE_URL}/api/v1`;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("mosque_session")?.value;
}

export async function getSubscriptionPlansAction() {
  const token = await getToken();
  if (!token) {
    return { status: "error", message: "Sesi tidak valid.", data: null };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/plans`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { status: "error", message: json?.message || "Gagal mengambil paket.", data: null };
    }
    return json;
  } catch {
    return { status: "error", message: "Terjadi kesalahan jaringan.", data: null };
  }
}

export async function createSubscriptionCheckoutAction(planCode: string) {
  const token = await getToken();
  if (!token) {
    return { error: "Sesi tidak valid atau telah berakhir." };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan_code: planCode }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: json?.message || "Gagal membuat checkout." };
    }
    return { data: json.data };
  } catch {
    return { error: "Terjadi kesalahan jaringan." };
  }
}

export async function createSubscriptionCheckoutV2Action(planCode: string, durationMonth: number) {
  const token = await getToken();
  if (!token) {
    return { error: "Sesi tidak valid atau telah berakhir." };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan_code: planCode, duration_month: durationMonth }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: json?.message || "Gagal membuat checkout." };
    }
    return { data: json.data };
  } catch {
    return { error: "Terjadi kesalahan jaringan." };
  }
}

export async function activateFreePlanAction() {
  const token = await getToken();
  if (!token) {
    return { error: "Sesi tidak valid atau telah berakhir." };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/activate-free`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: json?.message || "Gagal mengaktifkan paket free." };
    }
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan jaringan." };
  }
}

export async function getSubscriptionTransactionAction(transactionId: string) {
  const token = await getToken();
  if (!token) {
    return { status: "error", message: "Sesi tidak valid.", data: null };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { status: "error", message: json?.message || "Gagal mengambil status transaksi.", data: null };
    }
    return json;
  } catch {
    return { status: "error", message: "Terjadi kesalahan jaringan.", data: null };
  }
}

export async function getActiveSubscriptionTransactionAction() {
  const token = await getToken();
  if (!token) {
    return { status: "error", message: "Sesi tidak valid.", data: null };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/transactions/active`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { status: "error", message: json?.message || "Gagal mengambil transaksi aktif.", data: null };
    }
    return json;
  } catch {
    return { status: "error", message: "Terjadi kesalahan jaringan.", data: null };
  }
}

export async function cancelSubscriptionTransactionAction(transactionId: string) {
  const token = await getToken();
  if (!token) {
    return { error: "Sesi tidak valid atau telah berakhir." };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/transactions/${transactionId}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: json?.message || "Gagal membatalkan transaksi." };
    }
    return { data: json.data };
  } catch {
    return { error: "Terjadi kesalahan jaringan." };
  }
}

export async function getSubscriptionTransactionsAction(page = 1, limit = 20) {
  const token = await getToken();
  if (!token) {
    return { status: "error", message: "Sesi tidak valid.", data: [] };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/transactions?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { status: "error", message: json?.message || "Gagal mengambil riwayat transaksi.", data: [] };
    }
    return json;
  } catch {
    return { status: "error", message: "Terjadi kesalahan jaringan.", data: [] };
  }
}

export async function getSubscriptionQuoteAction(planCode: string, months: number) {
  const token = await getToken();
  if (!token) {
    return { status: "error", message: "Sesi tidak valid.", data: null };
  }

  try {
    const res = await fetch(`${API_URL}/tenant/subscription/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan_code: planCode, duration_month: months }),
      cache: "no-store",
    });

    if (!res.ok) {
      return { status: "error", message: "Quote endpoint tidak tersedia.", data: null };
    }

    const json = await res.json().catch(() => null);
    return json || { status: "error", message: "Data quote tidak valid.", data: null };
  } catch {
    return { status: "error", message: "Terjadi kesalahan jaringan.", data: null };
  }
}
