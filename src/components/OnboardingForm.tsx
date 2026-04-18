"use client";

import { useEffect, useMemo, useState } from "react";
import { getPublicPortalPatternExample, getSubdomainInputSuffix } from "@/lib/public-portal";
import PaymentModal from "./ui/PaymentModal";

interface PlanItem {
  plan_code: string;
  name: string;
  price: number;
  currency: string;
  features_unlocked: string[];
  attribution_enabled: boolean;
}

interface SubscriptionTransaction {
  transaction_id?: string;
  plan_code?: string;
  status?: string;
  payment_url?: string | null;
  order_id?: string;
  amount?: number | string;
  expired_at?: string;
  created_at?: string;
}

type ApiSuccess<T> = {
  status: "success";
  data: T;
  message?: string;
};

type ApiError = {
  status?: string;
  message?: string;
  error?: string;
};

const SUBDOMAIN_REGEX = /^[a-z-]{1,10}$/;

function sanitizeSubdomain(value: string) {
  return value.toLowerCase().replace(/[^a-z-]/g, "").slice(0, 10);
}

export default function OnboardingForm({
  plans,
  initialPaymentStatus,
}: {
  plans: PlanItem[];
  initialPaymentStatus: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("free");
  const [subscriptionTxID, setSubscriptionTxID] = useState<string>("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>(initialPaymentStatus || "pending");
  const [hasActiveTransaction, setHasActiveTransaction] = useState(false);
  const [activePaymentURL, setActivePaymentURL] = useState<string | null>(null);
  const [activeOrderID, setActiveOrderID] = useState<string>("");
  const [activeAmount, setActiveAmount] = useState<number>(0);
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [subdomainInput, setSubdomainInput] = useState<string>("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const isPaymentCompleted = ["paid", "free"].includes(subscriptionStatus);
  const isPaymentPending = subscriptionStatus === "pending";
  const canRetryPayment = ["expired", "failed", "cancel", "deny"].includes(subscriptionStatus);
  const showStep1 = !hasActiveTransaction && !isPaymentCompleted;
  const showTransactionDetail = hasActiveTransaction && !isPaymentCompleted;
  const selectedPlanInfo = useMemo(
    () => plans.find((p) => p.plan_code === selectedPlan) || null,
    [plans, selectedPlan]
  );

  const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
  const checkoutButtonLabel = selectedPlan === "free"
    ? "Aktifkan Paket Gratis"
    : canRetryPayment
      ? "Buat Ulang Pembayaran"
      : "Lanjutkan Pembayaran";

  useEffect(() => {
    const loadActive = async () => {
      const res = await fetchJson<SubscriptionTransaction>("/api/subscription/transactions/active");
      if (!isSuccessResponse(res) || !res.data) {
        return;
      }
      setSubscriptionTxID(res.data.transaction_id || "");
      setSelectedPlan(res.data.plan_code || "");
      setSubscriptionStatus(res.data.status || "pending");
      setHasActiveTransaction(res.data.status === "pending");
      setActivePaymentURL(res.data.payment_url || null);
      setActiveOrderID(res.data.order_id || "");
      setActiveAmount(Number(res.data.amount || 0));
      if (res.data.expired_at) {
        setPaymentDeadline(new Date(res.data.expired_at));
      } else if (res.data.created_at) {
        setPaymentDeadline(new Date(new Date(res.data.created_at).getTime() + 15 * 60 * 1000));
      }
    };
    if (!isPaymentCompleted) {
      void loadActive();
    }
  }, [isPaymentCompleted]);

  useEffect(() => {
    if (!paymentDeadline || !isPaymentPending) {
      return;
    }
    const updateTimer = () => {
      const diff = Math.floor((paymentDeadline.getTime() - Date.now()) / 1000);
      setTimeLeftSeconds(diff > 0 ? diff : 0);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [paymentDeadline, isPaymentPending]);

  useEffect(() => {
    if (!subscriptionTxID || !isPaymentPending) {
      return;
    }
    const timer = setInterval(async () => {
      const res = await fetchJson<SubscriptionTransaction>(`/api/subscription/transactions/detail?transactionId=${encodeURIComponent(subscriptionTxID)}`);
      if (!isSuccessResponse(res) || !res.data) {
        return;
      }
      setSubscriptionStatus(res.data.status || "pending");
      setHasActiveTransaction(res.data.status === "pending");
      if (res.data.status && res.data.status !== "pending") {
        setIsPaymentModalOpen(false);
      }
      if (res.data.payment_url) {
        setActivePaymentURL(res.data.payment_url);
      }
      if (res.data.expired_at) {
        setPaymentDeadline(new Date(res.data.expired_at));
      } else if (res.data.created_at) {
        setPaymentDeadline(new Date(new Date(res.data.created_at).getTime() + 15 * 60 * 1000));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [subscriptionTxID, isPaymentPending]);

  async function handleAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const normalizedSubdomain = sanitizeSubdomain(String(formData.get("subdomain") || ""));
    if (!SUBDOMAIN_REGEX.test(normalizedSubdomain)) {
      setError("Subdomain hanya boleh huruf kecil (a-z) dan strip (-), maksimal 10 karakter.");
      setIsLoading(false);
      return;
    }
    formData.set("subdomain", normalizedSubdomain);

    try {
      const response = await fetch("/api/tenant/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: String(formData.get("name") || "").trim(),
          subdomain: normalizedSubdomain,
        }),
      });

      const result = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!response.ok) {
        setError(result?.message || result?.error || "Gagal menyimpan data.");
        setIsLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setIsLoading(false);
    }
  }

  async function handleActivateFreePlan() {
    setPaymentError(null);
    setIsPaymentLoading(true);
    const result = await fetchJson<Record<string, never>>("/api/subscription/activate-free", { method: "POST" });
    if (!isSuccessResponse(result)) {
      setPaymentError(result.message || result.error || "Gagal mengaktifkan paket free.");
      setIsPaymentLoading(false);
      return;
    }
    setSubscriptionStatus("free");
    setHasActiveTransaction(false);
    setSubscriptionTxID("");
    setActivePaymentURL(null);
    setActiveOrderID("");
    setActiveAmount(0);
    setPaymentDeadline(null);
    setIsPaymentLoading(false);
  }

  async function handleCheckout() {
    if (!selectedPlan) {
      setPaymentError("Silakan pilih paket terlebih dahulu.");
      return;
    }

    setPaymentError(null);
    setIsPaymentLoading(true);

    if (selectedPlan === "free") {
      await handleActivateFreePlan();
      return;
    }

    const result = await fetchJson<SubscriptionTransaction>("/api/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_code: selectedPlan }),
    });
    if (!isSuccessResponse(result)) {
      setPaymentError(result.message || result.error || "Gagal membuat checkout.");
      setIsPaymentLoading(false);
      return;
    }

    const tx = result.data;
    if (!tx?.transaction_id || !tx?.payment_url) {
      setPaymentError("Checkout gagal diproses.");
      setIsPaymentLoading(false);
      return;
    }

    setSubscriptionTxID(tx.transaction_id);
    setSubscriptionStatus(tx.status || "pending");
    setHasActiveTransaction((tx.status || "pending") === "pending");
    setActivePaymentURL(tx.payment_url || null);
    setActiveOrderID(tx.order_id || "");
    setActiveAmount(Number(tx.amount || 0));
    if (tx.expired_at) {
      setPaymentDeadline(new Date(tx.expired_at));
    } else if (tx.created_at) {
      setPaymentDeadline(new Date(new Date(tx.created_at).getTime() + 15 * 60 * 1000));
    }
    setIsPaymentModalOpen(true);
    setIsPaymentLoading(false);
  }

  async function handleCheckPaymentStatus() {
    if (!subscriptionTxID) {
      setPaymentError("Transaksi pembayaran belum tersedia.");
      return;
    }
    setIsPaymentLoading(true);
    const res = await fetchJson<SubscriptionTransaction>(`/api/subscription/transactions/detail?transactionId=${encodeURIComponent(subscriptionTxID)}`);
    if (!isSuccessResponse(res)) {
      setPaymentError(res?.message || "Gagal cek status pembayaran.");
      setIsPaymentLoading(false);
      return;
    }
    const status = res.data.status || "pending";
    setSubscriptionStatus(status);
    setHasActiveTransaction(status === "pending");
    if (res.data.payment_url) {
      setActivePaymentURL(res.data.payment_url);
    }
    setActiveOrderID(res.data.order_id || activeOrderID);
    setActiveAmount(Number(res.data.amount || activeAmount));
    if (res.data.expired_at) {
      setPaymentDeadline(new Date(res.data.expired_at));
    } else if (res.data.created_at) {
      setPaymentDeadline(new Date(new Date(res.data.created_at).getTime() + 15 * 60 * 1000));
    }
    setIsPaymentLoading(false);
  }

  async function handleCancelPayment() {
    if (!subscriptionTxID) {
      setPaymentError("Transaksi pembayaran belum tersedia.");
      return;
    }
    setPaymentError(null);
    setIsPaymentLoading(true);
    const res = await fetchJson<Record<string, never>>("/api/subscription/transactions/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction_id: subscriptionTxID }),
    });
    if (!isSuccessResponse(res)) {
      setPaymentError(res.message || res.error || "Gagal membatalkan transaksi.");
      setIsPaymentLoading(false);
      return;
    }
    setSubscriptionStatus("failed");
    setHasActiveTransaction(false);
    setSubscriptionTxID("");
    setActivePaymentURL(null);
    setIsPaymentModalOpen(false);
    setActiveOrderID("");
    setActiveAmount(0);
    setPaymentDeadline(null);
    setIsPaymentLoading(false);
  }

  return (
    <form onSubmit={handleAction} className="space-y-4 md:space-y-5">
      <PaymentModal
        open={isPaymentModalOpen}
        title="Pembayaran Langganan"
        paymentUrl={activePaymentURL}
        orderId={activeOrderID}
        amountLabel={activeAmount ? formatRupiah(activeAmount) : undefined}
        onClose={() => setIsPaymentModalOpen(false)}
      />
      {showStep1 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs md:text-sm font-semibold text-emerald-800">Langkah 1: Pilih Paket (free langsung aktif, paket berbayar lewat Midtrans)</p>
        </div>
      )}

      {paymentError && (
        <div className="p-2.5 md:p-3 bg-red-50 text-red-600 text-xs md:text-sm rounded-lg border border-red-200">
          ⚠️ {paymentError}
        </div>
      )}

      {showStep1 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {plans.map((plan) => {
          const active = selectedPlan === plan.plan_code;
          return (
            <button
              type="button"
              key={plan.plan_code}
              onClick={() => {
                setSelectedPlan(plan.plan_code);
                if (plan.plan_code === "free" && !isPaymentCompleted && !hasActiveTransaction && !isPaymentLoading) {
                  void handleActivateFreePlan();
                }
              }}
              disabled={isPaymentCompleted || isPaymentLoading || hasActiveTransaction}
              className={`text-left rounded-lg border px-3 py-3 transition-all ${
                active ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
            >
              <p className="text-sm font-bold text-gray-900">{plan.name}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase">{plan.plan_code}</p>
              <p className="text-sm font-semibold text-emerald-700 mt-2">
                {plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")} / bulan`}
              </p>
            </button>
          );
        })}
      </div>
      )}

      {showTransactionDetail && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
          <p className="text-xs md:text-sm font-semibold text-amber-800">
            Transaksi pembayaran sudah dibuat untuk paket {selectedPlanInfo?.name || selectedPlan || "-"}.
          </p>
          <p className="text-[11px] md:text-xs text-amber-700">Order ID: <span className="font-bold">{activeOrderID || "-"}</span></p>
          <p className="text-[11px] md:text-xs text-amber-700">Nominal: <span className="font-bold">{formatRupiah(activeAmount)}</span></p>
          <p className="text-[11px] md:text-xs text-amber-700">
            Status saat ini: <span className="font-bold uppercase">{subscriptionStatus}</span>
          </p>
          <p className="text-[11px] md:text-xs text-amber-700">
            Batas bayar: <span className="font-bold">{timeLeftSeconds > 0 ? `${Math.floor(timeLeftSeconds / 60)
              .toString()
              .padStart(2, "0")}:${(timeLeftSeconds % 60).toString().padStart(2, "0")}` : "Habis"}</span>
          </p>
        </div>
      )}

      {!isPaymentCompleted && (
        <div className="flex gap-2 flex-wrap">
          {showStep1 && (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isPaymentLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 px-4 text-sm rounded-lg transition-colors"
            >
              {isPaymentLoading ? "Memproses..." : checkoutButtonLabel}
            </button>
          )}
          {showTransactionDetail && (
            <>
              {activePaymentURL && (
                <button
                  type="button"
                  onClick={() => window.open(activePaymentURL, "_blank", "noopener,noreferrer")}
                  disabled={isPaymentLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 px-4 text-sm rounded-lg transition-colors"
                >
                  Buka Pembayaran
                </button>
              )}
              <button
                type="button"
                onClick={handleCheckPaymentStatus}
                disabled={isPaymentLoading}
                className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-2.5 px-4 text-sm rounded-lg transition-colors"
              >
                Cek Status
              </button>
              <button
                type="button"
                onClick={handleCancelPayment}
                disabled={isPaymentLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2.5 px-4 text-sm rounded-lg transition-colors"
              >
                Batalkan
              </button>
            </>
          )}
        </div>
      )}

      {isPaymentCompleted && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs md:text-sm font-semibold text-emerald-800">
            {subscriptionStatus === "free"
              ? "Paket gratis aktif. Lanjutkan isi profil dan subdomain."
              : `Pembayaran paket terverifikasi (${subscriptionStatus}). Lanjutkan isi profil dan subdomain.`}
          </p>
        </div>
      )}

      {isPaymentCompleted && (
        <>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs md:text-sm font-semibold text-emerald-800">Langkah 2: Isi Identitas Sistem</p>
          </div>

          {error && (
            <div className="p-2.5 md:p-3 bg-red-50 text-red-600 text-xs md:text-sm rounded-lg border border-red-200">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Nama Resmi Organisasi/Masjid</label>
            <input
              type="text"
              name="name"
              placeholder="Contoh: Masjid Agung Sleman"
              required
              disabled={isLoading || !isPaymentCompleted}
              className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 shadow-sm"
            />
            <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2 font-medium leading-relaxed">
              Nama ini akan digunakan sebagai identitas akun utama di sistem eTAKMIR. Anda bebas mengatur nama tampilan publik (Profil Masjid) nanti di dasbor.
            </p>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Subdomain Pilihan</label>
            <div className="flex">
              <input
                type="text"
                name="subdomain"
                placeholder="masjid-agung"
                required
                maxLength={10}
                pattern="[a-z-]{1,10}"
                title="Hanya huruf kecil dan strip, maksimal 10 karakter"
                disabled={isLoading || !isPaymentCompleted}
                value={subdomainInput}
                onChange={(e) => setSubdomainInput(sanitizeSubdomain(e.target.value))}
                className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base rounded-l-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 shadow-sm"
              />
              <span className="inline-flex items-center px-3 md:px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-600 font-medium text-xs md:text-sm">
                {getSubdomainInputSuffix()}
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2 font-medium">Hanya huruf kecil (a-z) dan strip (-), tanpa angka/simbol lain, maksimal 10 karakter. Portal publik akan diakses sebagai {getPublicPortalPatternExample()}.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPaymentCompleted}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 md:py-3 px-4 text-sm md:text-base rounded-lg transition-colors mt-3 md:mt-4 flex justify-center items-center shadow-md"
          >
            {isLoading ? "Menyimpan Data..." : "Simpan Profil & Masuk Dasbor"}
          </button>
        </>
      )}
      {!isPaymentCompleted && (
        canRetryPayment ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs md:text-sm font-semibold text-rose-800">
              Pembayaran sebelumnya berstatus <span className="uppercase">{subscriptionStatus}</span>. Pilih paket lalu buat transaksi baru untuk melanjutkan setup.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs md:text-sm font-semibold text-blue-800">
              Langkah 2 akan ditampilkan otomatis setelah paket aktif (paid/free).
            </p>
          </div>
        )
      )}
    </form>
  );
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<ApiSuccess<T> | ApiError> {
  try {
    const onboardingToken = typeof window !== "undefined"
      ? window.sessionStorage.getItem("etakmir_onboarding_token") || ""
      : "";

    const response = await fetch(url, {
      ...init,
      credentials: "same-origin",
      headers: {
        ...(init?.headers || {}),
        ...(onboardingToken ? { "X-Session-Token": onboardingToken } : {}),
      },
    });
    const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

    if (!response.ok) {
      const errorBody = body as ApiError | null;
      return { error: errorBody?.message || errorBody?.error || "Terjadi kesalahan jaringan." };
    }

    if (!body) {
      return { error: "Respon server tidak valid." };
    }

    return body;
  } catch {
    return { error: "Terjadi kesalahan jaringan." };
  }
}

function isSuccessResponse<T>(response: ApiSuccess<T> | ApiError): response is ApiSuccess<T> {
  return response.status === "success";
}
