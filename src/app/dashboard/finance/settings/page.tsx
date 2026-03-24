"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, ShieldCheck, CreditCard, ArrowLeft, ChevronDown } from "lucide-react";

// ==========================================
// KOMPONEN CUSTOM DROPDOWN PROVIDER
// ==========================================
const CustomProviderSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { label: "Midtrans", value: "midtrans", disabled: false },
    { label: "Xendit (Segera Hadir)", value: "xendit", disabled: true }
  ];

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative w-full">
      {/* Tombol Pemilih */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none shadow-sm transition-colors hover:border-blue-400"
      >
        <span className="font-medium">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menu Pop-up */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 shadow-xl rounded-md z-50 overflow-hidden text-sm py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setIsOpen(false);
                  }
                }}
                className={`px-4 py-2.5 transition-colors ${
                  opt.disabled
                    ? "text-gray-400 bg-gray-50 cursor-default" // Dikunci: Teks abu-abu, cursor biasa
                    : "text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                } ${value === opt.value && !opt.disabled ? "bg-blue-50 font-bold text-blue-700" : ""}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function PGSettingsPage() {
  const router = useRouter();
  const [useCentralPg, setUseCentralPg] = useState(true);
  const [provider, setProvider] = useState("midtrans");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Pengaturan Payment Gateway berhasil disimpan! (Mock)");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Tombol Kembali / Escape */}
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pengaturan Payment Gateway</h2>
          <p className="text-gray-500 text-sm mt-1">
            Konfigurasikan jalur penerimaan dana otomatis untuk program donasi Anda.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Metode Pencairan & Gerbang Pembayaran</h3>
          <p className="text-xs text-gray-500 mt-1">Pilih layanan yang paling sesuai dengan kebutuhan administrasi masjid Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative flex cursor-pointer rounded-xl border p-5 transition-all ${useCentralPg ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-sm' : 'bg-white border-gray-200 hover:border-emerald-300'}`}>
              <input type="radio" name="pg_type" className="sr-only" checked={useCentralPg} onChange={() => setUseCentralPg(true)} />
              <div className="flex w-full items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${useCentralPg ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${useCentralPg ? 'text-emerald-900' : 'text-gray-900'}`}>Gunakan Layanan eTAKMIR</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Praktis. Dana masuk ke rekening eTAKMIR terlebih dahulu, lalu dicairkan ke rekening masjid secara berkala. Tanpa ribet urus API.</p>
                  </div>
                </div>
              </div>
            </label>

            <label className={`relative flex cursor-pointer rounded-xl border p-5 transition-all ${!useCentralPg ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
              <input type="radio" name="pg_type" className="sr-only" checked={!useCentralPg} onChange={() => setUseCentralPg(false)} />
              <div className="flex w-full items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${!useCentralPg ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${!useCentralPg ? 'text-blue-900' : 'text-gray-900'}`}>Payment Gateway Mandiri</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Dana langsung masuk ke akun Midtrans/Xendit milik masjid sendiri. Membutuhkan konfigurasi API Key teknis.</p>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {!useCentralPg && (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-5 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4">Kredensial API Payment Gateway</h4>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Penyedia Layanan (Provider)</label>
                {/* PEMANGGILAN CUSTOM DROPDOWN */}
                <CustomProviderSelect value={provider} onChange={setProvider} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Client Key</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono placeholder:text-gray-400" placeholder="SB-Mid-client-xxxx" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Server Key (Rahasia)</label>
                  <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono placeholder:text-gray-400" placeholder="SB-Mid-server-xxxx" />
                </div>
              </div>
              <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                <strong>Catatan Keamanan:</strong> Server Key akan dienkripsi secara aman di database peladen kami.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
              {isLoading ? "Menyimpan..." : <><Save className="w-4 h-4"/> Simpan Konfigurasi</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}