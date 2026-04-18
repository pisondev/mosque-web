"use client";

import { ExternalLink, X } from "lucide-react";

export default function PaymentModal({
  open,
  title,
  paymentUrl,
  orderId,
  amountLabel,
  onClose,
}: {
  open: boolean;
  title: string;
  paymentUrl: string | null;
  orderId?: string;
  amountLabel?: string;
  onClose: () => void;
}) {
  if (!open || !paymentUrl) return null;

  return (
    <div className="fixed inset-0 h-dvh w-screen z-[160] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 overflow-hidden">
      <div className="w-full max-w-3xl h-[92dvh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{orderId ? `Order ${orderId}` : "Selesaikan pembayaran tanpa keluar dari halaman ini."}{amountLabel ? ` - ${amountLabel}` : ""}</p>
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

        <div className="bg-gray-100 flex-1 min-h-0">
          <iframe
            title="Pembayaran"
            src={paymentUrl}
            className="w-full h-full bg-white"
            allow="payment *"
            scrolling="yes"
          />
        </div>
      </div>
    </div>
  );
}
