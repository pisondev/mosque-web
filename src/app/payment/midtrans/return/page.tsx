"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

const MIDTRANS_RETURN_MESSAGE = "etakmir:midtrans:return";

export default function MidtransReturnPage() {
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: MIDTRANS_RETURN_MESSAGE,
          href: window.location.href,
          at: Date.now(),
        },
        window.location.origin,
      );
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white shadow-sm p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">Kembali ke e-Takmir</h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Status pembayaran sudah dikirim kembali ke aplikasi. Jendela ini akan tertutup otomatis dalam beberapa saat.
        </p>
      </div>
    </main>
  );
}
