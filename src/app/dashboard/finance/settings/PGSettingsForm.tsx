"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, ShieldCheck, CreditCard, ArrowLeft, ChevronDown } from "lucide-react";
import { updatePgConfig } from "../../../actions/finance";
import { useToast } from "../../../../components/ui/Toast";

// KOMPONEN CUSTOM DROPDOWN PROVIDER
const CustomProviderSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { label: "Midtrans", value: "midtrans", disabled: false },
    { label: "Xendit (Segera Hadir)", value: "xendit", disabled: true }
  ];
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative w-full">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none shadow-sm transition-colors hover:border-blue-400">
        <span className="font-medium">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 shadow-xl rounded-md z-50 overflow-hidden text-sm py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((opt) => (
              <div key={opt.value} onClick={() => { if (!opt.disabled) { onChange(opt.value); setIsOpen(false); } }} className={`px-4 py-2.5 transition-colors ${opt.disabled ? "text-gray-400 bg-gray-50 cursor-default" : "text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-700"} ${value === opt.value && !opt.disabled ? "bg-blue-50 font-bold text-blue-700" : ""}`}>
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function PGSettingsForm({ initialConfig }: { initialConfig: any }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  // State diambil dari database backend
  const [useCentralPg, setUseCentralPg] = useState(initialConfig?.use_central_pg ?? true);
  const [provider, setProvider] = useState(initialConfig?.provider || "midtrans");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Siapkan payload sesuai kontrak
    const payload = {
      use_central_pg: useCentralPg,
      provider: provider,
      client_key: formData.get("client_key") || "",
      server_key: formData.get("server_key") || "", // akan kosong jika takmir tidak mengetik ulang (aman)
      is_production: false // Default Sandbox untuk saat ini
    };

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      const res = await updatePgConfig(submitData);
      if (res.error) addToast(res.error, "error");
      else addToast("Pengaturan Payment Gateway berhasil disimpan!", "success");
    });
  };

  return (
    <>
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Metode Pencairan & Gerbang Pembayaran</h3>
          <p className="text-xs text-gray-500 mt-1">Pilih layanan yang paling sesuai dengan kebutuhan administrasi masjid Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative flex cursor-pointer rounded-xl border p-5 transition-all ${useCentralPg ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-sm' : 'bg-white border-gray-200 hover:border-emerald-300'}`}>
              <input type="radio" className="sr-only" checked={useCentralPg} onChange={() => setUseCentralPg(true)} />
              <div className="flex w-full items-start gap-4">
                <div className={`p-2 rounded-full ${useCentralPg ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <p className={`font-bold text-sm ${useCentralPg ? 'text-emerald-900' : 'text-gray-900'}`}>Gunakan Layanan eTAKMIR</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Praktis. Dana masuk ke rekening eTAKMIR terlebih dahulu, lalu dicairkan ke rekening masjid secara berkala.</p>
                </div>
              </div>
            </label>

            <label className={`relative flex cursor-pointer rounded-xl border p-5 transition-all ${!useCentralPg ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
              <input type="radio" className="sr-only" checked={!useCentralPg} onChange={() => setUseCentralPg(false)} />
              <div className="flex w-full items-start gap-4">
                <div className={`p-2 rounded-full ${!useCentralPg ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}><CreditCard className="w-5 h-5" /></div>
                <div>
                  <p className={`font-bold text-sm ${!useCentralPg ? 'text-blue-900' : 'text-gray-900'}`}>Payment Gateway Mandiri</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Dana langsung masuk ke akun Midtrans/Xendit milik masjid sendiri. Membutuhkan konfigurasi API Key teknis.</p>
                </div>
              </div>
            </label>
          </div>

          {!useCentralPg && (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-5 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4">Kredensial API Payment Gateway</h4>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Penyedia Layanan (Provider)</label>
                <CustomProviderSelect value={provider} onChange={setProvider} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Client Key</label>
                  {/* Gunakan data yang sudah ada di database jika ada */}
                  <input type="text" name="client_key" defaultValue={initialConfig?.client_key || ""} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono placeholder:text-gray-400" placeholder="SB-Mid-client-xxxx" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Server Key (Rahasia)</label>
                  {/* Password input, dikosongkan untuk mencegah key terekspos ulang */}
                  <input type="password" name="server_key" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono placeholder:text-gray-400" placeholder={initialConfig?.client_key ? "******** (Kosongkan jika tidak ingin diubah)" : "SB-Mid-server-xxxx"} />
                </div>
              </div>
              <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                <strong>Catatan Keamanan:</strong> Server Key tidak ditampilkan demi keamanan. Biarkan kosong jika Anda tidak ingin mengubah Server Key yang sudah ada.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
              {isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> Simpan Konfigurasi</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}