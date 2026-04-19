"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBilling } from "../../../components/providers/BillingProvider";
import {
  cancelSubscriptionTransactionAction,
  createSubscriptionCheckoutV2Action,
  getActiveSubscriptionTransactionAction,
  getSubscriptionQuoteAction,
  getSubscriptionTransactionAction,
  getSubscriptionTransactionsAction,
} from "../../actions/subscription";
import { useToast } from "../../../components/ui/Toast";
import { ArrowRightLeft, CalendarClock, Crown, ExternalLink, ReceiptText, X } from "lucide-react";
import PaymentModal from "../../../components/ui/PaymentModal";

type PlanItem = {
  plan_code: string;
  name: string;
  price: number;
  currency: string;
};

type SubscriptionStatus = {
  active_plan: string;
  remaining_days?: number;
  next_billing_due_date?: string;
  current_period_start?: string;
  current_period_end?: string;
};

type SubscriptionTransaction = {
  transaction_id?: string;
  order_id?: string;
  plan_code?: string;
  status?: string;
  amount?: number | string;
  duration_month?: number;
  payment_url?: string;
  created_at?: string;
  paid_at?: string;
  expired_at?: string;
  action?: string;
  warning_message?: string;
};

type QuoteResponse = {
  target_plan_code: string;
  action: string;
  duration_month: number;
  amount: number;
  warning_message?: string;
  status?: SubscriptionStatus;
};

function formatRupiah(value: number) {
  return `Rp ${Math.max(0, Math.round(value)).toLocaleString("id-ID")}`;
}

function formatDate(value?: string) {
  if (!value) return "Belum tersedia";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateTimeWIB(value?: string) {
  if (!value) return "Belum tersedia";
  return `${new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  })} WIB`;
}

function normalizeStatus(status?: string) {
  switch (status) {
    case "paid":
      return "Berhasil";
    case "pending":
      return "Menunggu Pembayaran";
    case "failed":
      return "Gagal";
    case "expired":
      return "Kedaluwarsa";
    case "free":
      return "Gratis";
    default:
      return "Tidak aktif";
  }
}

export default function SubscriptionManager({ plans }: { plans: PlanItem[] }) {
  const { subscription_plan } = useBilling();
  const { addToast } = useToast();

  const [duration, setDuration] = useState(1);
  const [statusSummary, setStatusSummary] = useState<SubscriptionStatus>({ active_plan: subscription_plan });
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [pendingTx, setPendingTx] = useState<SubscriptionTransaction | null>(null);
  const [selectorMode, setSelectorMode] = useState<"upgrade" | "downgrade" | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const activePlanCode = statusSummary.active_plan || subscription_plan;
  const activePlan = useMemo(() => plans.find((plan) => plan.plan_code === activePlanCode), [plans, activePlanCode]);

  const availableUpgrades = useMemo(() => {
    const currentPrice = activePlan?.price || 0;
    return plans.filter((plan) => plan.plan_code !== activePlanCode && plan.price > currentPrice);
  }, [activePlan, activePlanCode, plans]);

  const availableDowngrades = useMemo(() => {
    const currentPrice = activePlan?.price || 0;
    return plans.filter((plan) => plan.plan_code !== activePlanCode && plan.price < currentPrice);
  }, [activePlan, activePlanCode, plans]);

  const selectablePlans = selectorMode === "upgrade" ? availableUpgrades : availableDowngrades;
  const nextRenewalAmount = activePlan ? activePlan.price * duration : 0;
  const planNameMap = useMemo(() => Object.fromEntries(plans.map((plan) => [plan.plan_code, plan.name])), [plans]);

  const loadSubscriptionState = useCallback(async () => {
    const [historyRes, activeRes] = await Promise.all([
      getSubscriptionTransactionsAction(1, 20),
      getActiveSubscriptionTransactionAction(),
    ]);

    if (historyRes?.status === "success") {
      const payload = historyRes.data || {};
      setStatusSummary(payload.status || { active_plan: subscription_plan });
      setTransactions(Array.isArray(payload.transactions) ? payload.transactions : []);
    }

    if (activeRes?.status === "success" && activeRes.data) {
      setPendingTx(activeRes.data.status === "pending" ? activeRes.data : null);
    } else {
      setPendingTx(null);
    }
  }, [subscription_plan]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSubscriptionState();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSubscriptionState]);

  useEffect(() => {
    if (!pendingTx?.transaction_id || pendingTx.status !== "pending") return;

    const timer = setInterval(async () => {
      // Poll active transaction endpoint to avoid stale single-transaction state.
      const activeRes = await getActiveSubscriptionTransactionAction();
      if (activeRes?.status === "success") {
        const active = activeRes.data;
        if (!active || active.status !== "pending") {
          setPendingTx(null);
          setIsPaymentModalOpen(false);
          await loadSubscriptionState();
          return;
        }
        setPendingTx(active);
      }

      const res = await getSubscriptionTransactionAction(pendingTx.transaction_id || "");
      if (res?.status !== "success" || !res.data) return;

      // Auto close and refresh if transaction finalized.
      if (res.data.status && res.data.status !== "pending") {
        setPendingTx(null);
        setIsPaymentModalOpen(false);
        await loadSubscriptionState();
        return;
      }

      setPendingTx(res.data);

      // Auto cancel if deadline passed and backend still marks pending.
      if (res.data.expired_at) {
        const expiredAt = new Date(res.data.expired_at).getTime();
        if (!Number.isNaN(expiredAt) && Date.now() >= expiredAt) {
          await cancelSubscriptionTransactionAction(res.data.transaction_id || "");
          setPendingTx(null);
          setIsPaymentModalOpen(false);
          await loadSubscriptionState();
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [loadSubscriptionState, pendingTx?.transaction_id, pendingTx?.status]);

  const handleCancelPending = async () => {
    if (!pendingTx?.transaction_id) return;
    setIsCancelLoading(true);
    const res = await cancelSubscriptionTransactionAction(pendingTx.transaction_id);
    setIsCancelLoading(false);
    if (res?.error) {
      addToast(res.error, "error");
      return;
    }
    addToast("Transaksi pending berhasil dibatalkan.", "success");
    setPendingTx(null);
    setIsPaymentModalOpen(false);
    await loadSubscriptionState();
  };

  useEffect(() => {
    const loadQuote = async () => {
      if (!selectorMode || !selectedPlanCode) {
        setQuote(null);
        return;
      }

      setIsQuoteLoading(true);
      const quoteRes = await getSubscriptionQuoteAction(selectedPlanCode, selectorMode === "upgrade" ? 1 : 1);
      setIsQuoteLoading(false);

      if (quoteRes?.status === "success" && quoteRes.data) {
        setQuote(quoteRes.data);
      } else {
        setQuote(null);
      }
    };

    void loadQuote();
  }, [selectorMode, selectedPlanCode]);

  const openSelector = (mode: "upgrade" | "downgrade") => {
    setSelectorMode(mode);
    const firstPlan = (mode === "upgrade" ? availableUpgrades : availableDowngrades)[0];
    setSelectedPlanCode(firstPlan?.plan_code || "");
    setQuote(null);
  };

  const closeSelector = () => {
    setSelectorMode(null);
    setSelectedPlanCode("");
    setQuote(null);
  };

  const handleRenew = async () => {
    if (!activePlan || activePlan.plan_code === "free") return;

    setIsCheckoutLoading(true);
    const res = await createSubscriptionCheckoutV2Action(activePlan.plan_code, duration);
    setIsCheckoutLoading(false);

    if (res?.error) {
      addToast(res.error, "error");
      return;
    }

    if (res.data?.payment_url) {
      setPendingTx(res.data);
      addToast("Tagihan perpanjangan berhasil dibuat.", "success");
      setIsPaymentModalOpen(true);
      return;
    }

    addToast("Tagihan perpanjangan berhasil dibuat.", "success");
    await loadSubscriptionState();
  };

  const handlePlanChangeCheckout = async () => {
    if (!quote || !selectedPlanCode) return;

    setIsCheckoutLoading(true);
    const res = await createSubscriptionCheckoutV2Action(selectedPlanCode, quote.duration_month || 1);
    setIsCheckoutLoading(false);

    if (res?.error) {
      addToast(res.error, "error");
      return;
    }

    if (res.data?.action === "downgrade" || res.data?.status === "downgrade") {
      addToast(res.data.warning_message || "Permintaan downgrade berhasil dicatat.", "success");
      closeSelector();
      await loadSubscriptionState();
      return;
    }

    if (res.data?.payment_url) {
      setPendingTx(res.data);
      addToast("Tagihan berhasil dibuat. Selesaikan pembayaran untuk melanjutkan.", "success");
      closeSelector();
      setIsPaymentModalOpen(true);
      return;
    }

    addToast("Perubahan paket berhasil diproses.", "success");
    closeSelector();
    await loadSubscriptionState();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <PaymentModal
        open={isPaymentModalOpen}
        title="Pembayaran Langganan"
        paymentUrl={pendingTx?.payment_url || null}
        orderId={pendingTx?.order_id}
        amountLabel={pendingTx?.amount ? formatRupiah(Number(pendingTx.amount)) : undefined}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentReturn={() => {
          void loadSubscriptionState();
        }}
      />
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-amber-100 p-2.5 rounded-lg text-amber-700 shadow-sm">
          <Crown className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Langganan</h2>
          <p className="text-gray-500 text-sm mt-1">Pantau status paket, tagihan berikutnya, dan seluruh transaksi pembayaran langganan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/50 to-amber-50/40 p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Paket Aktif</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{activePlan?.name || "Belum aktif"}</h3>
              <p className="text-sm text-gray-500 mt-1">Status transaksi terakhir: <span className="font-bold text-gray-700">{normalizeStatus(transactions[0]?.status)}</span></p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700 shadow-sm">
              Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Durasi Berjalan</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{statusSummary.remaining_days ? `${statusSummary.remaining_days} hari tersisa` : "Belum tersedia"}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Periode Mulai</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{formatDateTimeWIB(statusSummary.current_period_start)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Periode Berakhir</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{formatDateTimeWIB(statusSummary.current_period_end || statusSummary.next_billing_due_date)}</p>
            </div>
          </div>

          {pendingTx?.payment_url && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-amber-900">Ada transaksi pembayaran yang masih menunggu.</p>
                <p className="text-xs text-amber-800 mt-1">Order {pendingTx.order_id} - {pendingTx.plan_code} - {formatRupiah(Number(pendingTx.amount || 0))}</p>
                {pendingTx.expired_at && (
                  <p className="text-xs text-amber-900 mt-1">Batas pembayaran: {formatDateTimeWIB(pendingTx.expired_at)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold"
                >
                  Buka Pembayaran <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={isCancelLoading}
                  onClick={() => void handleCancelPending()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 text-sm font-bold disabled:opacity-50"
                >
                  {isCancelLoading ? "Membatalkan..." : "Batalkan"}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {activePlanCode === "free" ? (
              <button type="button" onClick={() => openSelector("upgrade")} className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">
                Upgrade Paket
              </button>
            ) : activePlanCode === "max_plus" ? (
              <button type="button" onClick={() => openSelector("downgrade")} className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 hover:border-emerald-300 text-gray-800 text-sm font-bold">
                Downgrade Paket
              </button>
            ) : (
              <>
                <button type="button" onClick={() => openSelector("upgrade")} className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">
                  Upgrade Paket
                </button>
                <button type="button" onClick={() => openSelector("downgrade")} className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 hover:border-emerald-300 text-gray-800 text-sm font-bold">
                  Downgrade Paket
                </button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-bold">
            <CalendarClock className="w-4.5 h-4.5" /> Perpanjangan Layanan
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 3, 6, 12].map((month) => (
              <button
                key={month}
                type="button"
                onClick={() => setDuration(month)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${duration === month ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 hover:border-emerald-300 text-gray-600"}`}
              >
                {month} Bulan
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tagihan Perpanjangan</p>
            <p className="text-lg font-black text-gray-900 mt-1">{activePlanCode === "free" ? "Pilih upgrade terlebih dahulu" : formatRupiah(nextRenewalAmount)}</p>
            <p className="text-[11px] text-gray-500 mt-1">Periode aktif saat ini berakhir pada {formatDateTimeWIB(statusSummary.current_period_end || statusSummary.next_billing_due_date)}.</p>
          </div>
          <button type="button" onClick={() => void handleRenew()} disabled={isCheckoutLoading || activePlanCode === "free"} className="w-full px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-bold">
            {isCheckoutLoading ? "Memproses..." : "Perpanjang Sekarang"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ReceiptText className="w-4.5 h-4.5 text-gray-700" />
          <h3 className="font-bold text-gray-900">Riwayat Transaksi</h3>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada transaksi langganan yang tersimpan.</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.transaction_id || tx.order_id} className="rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{tx.order_id || tx.transaction_id || "-"}</p>
                  <p className="text-xs text-gray-600 mt-1">{planNameMap[tx.plan_code || ""] || tx.plan_code || "-"} - {normalizeStatus(tx.status)}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-bold text-gray-900">{formatRupiah(Number(tx.amount || 0))}</p>
                  <p className="text-xs text-gray-500 mt-1">{tx.paid_at ? `Dibayar ${formatDate(tx.paid_at)}` : `Dibuat ${formatDate(tx.created_at)}`}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectorMode && (
        <div className="fixed inset-0 z-[145] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectorMode === "upgrade" ? "Upgrade Paket" : "Downgrade Paket"}</h3>
                <p className="text-xs text-gray-500 mt-1">Pilih paket tujuan. Paket aktif saat ini tidak dapat dipilih.</p>
              </div>
              <button type="button" onClick={closeSelector} className="p-2 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <ArrowRightLeft className="w-3.5 h-3.5" /> Geser untuk melihat pilihan paket
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {selectablePlans.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-500 w-full text-center">Tidak ada paket yang tersedia untuk opsi ini.</div>
                ) : (
                  selectablePlans.map((plan) => (
                    <button
                      key={plan.plan_code}
                      type="button"
                      onClick={() => setSelectedPlanCode(plan.plan_code)}
                      className={`min-w-[240px] text-left rounded-xl border p-4 transition-all ${selectedPlanCode === plan.plan_code ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-gray-200 hover:border-emerald-300 bg-white"}`}
                    >
                      <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                      <p className="text-[11px] uppercase tracking-wider mt-1 text-gray-500">{plan.plan_code}</p>
                      <p className="text-sm mt-3 font-semibold text-emerald-700">{plan.price === 0 ? "Gratis" : `${formatRupiah(plan.price)} / bulan`}</p>
                    </button>
                  ))
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 min-h-[120px]">
                {isQuoteLoading ? (
                  <p className="text-sm text-gray-500">Menghitung tagihan...</p>
                ) : quote ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimasi Tagihan</p>
                    <p className="text-2xl font-black text-gray-900">{formatRupiah(quote.amount || 0)}</p>
                    <p className="text-sm text-gray-600">
                      {quote.action === "upgrade" && "Tagihan dihitung proporsional sesuai sisa masa aktif paket saat ini."}
                      {quote.action === "downgrade" && "Downgrade tidak menimbulkan tagihan baru."}
                      {quote.action === "renew" && "Perpanjangan mengikuti durasi yang dipilih."}
                    </p>
                    {quote.action === "downgrade" && <p className="text-sm text-gray-600">Paket akan langsung diubah ke paket tujuan. Akses fitur yang tidak termasuk dalam paket baru akan berhenti mengikuti perubahan ini, dan tidak ada penggantian dana untuk sisa periode berjalan.</p>}
                    {quote.warning_message && quote.action !== "downgrade" && <p className="text-sm text-amber-700">{quote.warning_message}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Pilih paket terlebih dahulu untuk melihat estimasi tagihan.</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeSelector} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Tutup</button>
                <button type="button" disabled={!quote || isCheckoutLoading || selectablePlans.length === 0} onClick={() => void handlePlanChangeCheckout()} className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-bold">
                  {isCheckoutLoading ? "Memproses..." : selectorMode === "upgrade" ? "Lanjutkan Upgrade" : "Proses Downgrade"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
