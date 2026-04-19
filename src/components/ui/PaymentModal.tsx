"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, LoaderCircle, ShieldCheck, X } from "lucide-react";

const MIDTRANS_RETURN_MESSAGE = "etakmir:midtrans:return";

export default function PaymentModal({
  open,
  title,
  paymentUrl,
  orderId,
  amountLabel,
  onClose,
  onPaymentReturn,
}: {
  open: boolean;
  title: string;
  paymentUrl: string | null;
  orderId?: string;
  amountLabel?: string;
  onClose: () => void;
  onPaymentReturn?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const onCloseRef = useRef(onClose);
  const onPaymentReturnRef = useRef(onPaymentReturn);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  useEffect(() => {
    onCloseRef.current = onClose;
    onPaymentReturnRef.current = onPaymentReturn;
  }, [onClose, onPaymentReturn]);

  useEffect(() => {
    if (!open || !paymentUrl) return;

    const loadingTimer = window.setTimeout(() => {
      setIsIframeLoading(true);
    }, 0);

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== MIDTRANS_RETURN_MESSAGE) return;
      onPaymentReturnRef.current?.();
      onCloseRef.current();
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.clearTimeout(loadingTimer);
      window.removeEventListener("message", handleMessage);
      setIsIframeLoading(true);
    };
  }, [open, paymentUrl]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    setIsIframeLoading(false);
    if (!iframe) return;

    try {
      const href = iframe.contentWindow?.location.href || "";
      if (href.startsWith(window.location.origin) && href.includes("/payment/midtrans/return")) {
        onPaymentReturnRef.current?.();
        onCloseRef.current();
      }
    } catch {
      // Ignore cross-origin access until Midtrans redirects back to this app.
    }
  };

  if (!open || !paymentUrl) return null;

  return (
    <div className="fixed inset-0 h-dvh w-screen z-[160] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 overflow-hidden">
      <div className="w-full max-w-4xl h-[92dvh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{orderId ? `Order ${orderId}` : "Pembayaran Midtrans"}{amountLabel ? ` - ${amountLabel}` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={paymentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Buka di Tab Baru <ExternalLink className="w-4 h-4" />
            </a>
            <button type="button" onClick={onClose} className="p-2 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-3 text-sm">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 flex gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">Pembayaran terbuka di modal halaman yang sama.</p>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Modal akan tertutup otomatis saat Midtrans mengarahkan kembali ke callback aplikasi.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Order ID</p>
            <p className="mt-1 text-sm font-bold text-gray-900 break-all">{orderId || "-"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Nominal</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{amountLabel || "-"}</p>
          </div>
        </div>

        <div className="relative flex-1 bg-gray-100 min-h-0">
          {isIframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/92 backdrop-blur-sm text-center px-6">
              <LoaderCircle className="w-7 h-7 text-emerald-600 animate-spin" />
              <div>
                <p className="text-sm font-bold text-gray-900">Memuat halaman pembayaran Midtrans</p>
                <p className="text-xs text-gray-500 mt-1">Tunggu beberapa detik sampai form pembayaran tampil.</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="Pembayaran Midtrans"
            src={paymentUrl}
            className="w-full h-full bg-white"
            allow="payment *"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}
