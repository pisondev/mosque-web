"use client";

import { useBilling } from "../../../components/providers/BillingProvider";
import { LayoutTemplate, Crown, CheckCircle2, Lock, HardDrive, ArrowRight } from "lucide-react";

// MOCK DATA TEMPLATE (Nanti bisa dipindahkan ke database/API jika kakakmu sudah membuatnya)
const TEMPLATE_CATALOG = [
  { id: "template_default", name: "Bawaan (Minimalis)", type: "free", image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=400" },
  { id: "template_premium_1", name: "Elegan & Modern", type: "premium", image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=400" },
  { id: "template_premium_2", name: "Klasik Islami", type: "premium", image: "https://images.unsplash.com/photo-1564198879220-63f2734f7fea?auto=format&fit=crop&q=80&w=400" },
  { id: "template_premium_3", name: "Komunitas Aktif", type: "premium", image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=400" },
];

// Helper Format Paket
const formatPlanName = (plan: string) => {
  if (plan === "free") return "Paket FREE";
  if (plan === "premium_plus") return "PREMIUM+";
  if (plan === "pro_plus") return "PRO++";
  if (plan === "max_plus") return "MAX+++";
  return plan.toUpperCase();
};

export default function TemplatesPage() {
  // Mengambil state SaaS langsung dari Global Provider yang kita buat di Tahap 1
  const { subscription_plan, active_template, storage } = useBilling();

  const isFreePlan = subscription_plan === "free";
  const storagePercentage = storage.limit_mb > 0 ? Math.min(Math.round((storage.used_mb / storage.limit_mb) * 100), 100) : 0;

  const handleSelectTemplate = (templateId: string, isPremium: boolean) => {
    if (isPremium && isFreePlan) {
      alert("Template ini eksklusif untuk pengguna Premium. Silakan tingkatkan paket Anda!");
      return;
    }
    // TODO: Integrasikan dengan API PUT /api/v1/tenant/template (Nanti dibuat oleh backend)
    alert(`Mock: Menyimpan preferensi template ${templateId} ke database...`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* HEADER HALAMAN */}
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Paket & Tampilan Website</h2>
          <p className="text-gray-500 text-sm mt-1">
            Pantau status langganan Anda dan atur desain halaman publik yang dilihat oleh jamaah.
          </p>
        </div>
      </div>

      {/* KARTU STATUS LANGGANAN & KUOTA (Hero Section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Paket */}
        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-emerald-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm tracking-widest uppercase">Status Langganan</span>
            </div>
            <h3 className="text-3xl font-black mb-1">{formatPlanName(subscription_plan)}</h3>
            <p className="text-gray-300 text-sm max-w-md">
              {isFreePlan 
                ? "Anda menggunakan paket dasar. Tingkatkan untuk membuka fitur manajemen donasi, event, dan menghilangkan atribusi eTAKMIR." 
                : "Terima kasih telah mempercayakan pengelolaan digital masjid Anda bersama layanan premium eTAKMIR."}
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Biaya Platform Donasi: <strong className="text-white">{subscription_plan === "max_plus" ? "0%" : "0.5%"}</strong></span>
            {isFreePlan && (
              <button className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 text-sm font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-2">
                Upgrade Paket <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Info Kuota Penyimpanan */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <HardDrive className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-800">Kuota Media</h4>
          </div>
          
          {storage.limit_mb === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-500 text-sm font-medium">Galeri tidak tersedia di paket FREE.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold text-gray-900">{storage.used_mb}<span className="text-sm font-medium text-gray-500 ml-1">MB</span></span>
                <span className="text-xs font-semibold text-gray-400 uppercase">Limit: {storage.limit_mb} MB</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${storagePercentage > 85 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                  style={{ width: `${storagePercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-right">{storagePercentage}% Terpakai</p>
            </>
          )}
        </div>
      </div>

      {/* GALERI PILIHAN TEMPLATE */}
      <div className="pt-6">
        <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
          Katalog Desain Website Publik
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATE_CATALOG.map((template) => {
            const isActive = active_template === template.id;
            const isLocked = template.type === "premium" && isFreePlan;

            return (
              <div key={template.id} className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 flex flex-col ${isActive ? "border-emerald-500 shadow-md ring-4 ring-emerald-50" : "border-gray-200 hover:border-emerald-300 hover:shadow-md"}`}>
                
                {/* Thumbnail Gambar */}
                <div className="h-40 bg-gray-100 relative group overflow-hidden">
                  <img src={template.image} alt={template.name} className={`w-full h-full object-cover transition-transform duration-700 ${!isLocked ? "group-hover:scale-110" : "opacity-60 grayscale"}`} />
                  
                  {isLocked && (
                    <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-bold text-gray-800">
                        <Lock className="w-3.5 h-3.5 text-amber-500" /> Premium
                      </div>
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Konten Kartu */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-xs text-gray-500 mb-4">{template.type === "free" ? "Tersedia untuk semua paket." : "Eksklusif Premium / PRO."}</p>
                  
                  <div className="mt-auto">
                    {isActive ? (
                      <button disabled className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 cursor-default">
                        Sedang Digunakan
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSelectTemplate(template.id, template.type === "premium")}
                        className={`w-full font-bold py-2 rounded-lg text-sm transition-colors border ${
                          isLocked 
                            ? "bg-white border-amber-200 text-amber-700 hover:bg-amber-50" 
                            : "bg-white border-gray-300 text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                        }`}
                      >
                        {isLocked ? "Upgrade untuk Pakai" : "Gunakan Desain"}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}