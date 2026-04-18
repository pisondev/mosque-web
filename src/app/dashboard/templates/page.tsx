"use client";

import { useEffect, useState } from "react";
import { useBilling } from "../../../components/providers/BillingProvider";
import { LayoutTemplate, CheckCircle2, Lock, HardDrive } from "lucide-react";
import { useDecisionModal } from "../../../components/ui/DecisionModalProvider";

const TEMPLATE_CATALOG = [
  { id: "template_default", name: "Bawaan (Minimalis)", type: "free", image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=400" },
  { id: "template_premium_1", name: "Elegan & Modern", type: "premium", image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=400" },
  { id: "template_premium_2", name: "Klasik Islami", type: "premium", image: "https://images.unsplash.com/photo-1564198879220-63f2734f7fea?auto=format&fit=crop&q=80&w=400" },
  { id: "template_premium_3", name: "Komunitas Aktif", type: "premium", image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=400" },
];

export default function TemplatesPage() {
  const { subscription_plan, active_template, storage } = useBilling();
  const { notify } = useDecisionModal();
  const [realUsedMB, setRealUsedMB] = useState<number | null>(null);

  const isFreePlan = subscription_plan === "free";
  const usedMB = realUsedMB ?? storage.used_mb;
  const remainingMB = Math.max(0, storage.limit_mb - usedMB);
  const storagePercentage = storage.limit_mb > 0 ? Math.min(Math.round((usedMB / storage.limit_mb) * 100), 100) : 0;
  const currentTemplate = TEMPLATE_CATALOG.find((template) => template.id === active_template);

  useEffect(() => {
    fetch("/api/storage-quota", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        const next = Number(json?.data?.used_mb);
        if (!Number.isNaN(next)) {
          setRealUsedMB(next);
        }
      })
      .catch(() => undefined);
  }, []);

  const handleSelectTemplate = async (templateId: string, isPremium: boolean) => {
    if (isPremium && isFreePlan) {
      await notify({
        title: "Template premium",
        description: "Template ini eksklusif untuk pengguna premium. Tingkatkan paket pada menu Kelola Langganan.",
      });
      return;
    }

    await notify({
      title: "Integrasi template",
      description: `Mock: menyimpan preferensi template ${templateId} ke backend.`,
      icon: "info",
      closeLabel: "Mengerti",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tampilan Website</h2>
          <p className="text-gray-500 text-sm mt-1">Pilih template aktif dan pantau kuota media untuk tampilan publik jamaah.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-emerald-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200 font-bold">Template Aktif Saat Ini</p>
            <h3 className="text-3xl font-black mt-2">{currentTemplate?.name || "Belum ditentukan"}</h3>
            <p className="text-sm text-gray-300 mt-2">Template aktif menentukan gaya halaman publik: beranda, agenda, konten, dan galeri.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <HardDrive className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-800">Kuota Media</h4>
          </div>

          {storage.limit_mb === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-500 text-sm font-medium">Galeri tidak tersedia pada paket saat ini.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold text-gray-900">{usedMB.toFixed(2)}<span className="text-sm font-medium text-gray-500 ml-1">MB</span></span>
                <span className="text-xs font-semibold text-gray-400 uppercase">Limit: {storage.limit_mb} MB</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                <div className={`h-full rounded-full transition-all duration-1000 ${storagePercentage > 85 ? "bg-rose-500" : "bg-blue-500"}`} style={{ width: `${storagePercentage}%` }} />
              </div>
              <p className="text-xs text-gray-500 text-right">Sisa {remainingMB.toFixed(2)} MB • {storagePercentage}% terpakai</p>
            </>
          )}
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-bold text-gray-900 text-lg mb-4">Katalog Desain Website Publik</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATE_CATALOG.map((template) => {
            const isActive = active_template === template.id;
            const isLocked = template.type === "premium" && isFreePlan;

            return (
              <div key={template.id} className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 flex flex-col ${isActive ? "border-emerald-500 shadow-md ring-4 ring-emerald-50" : "border-gray-200 hover:border-emerald-300 hover:shadow-md"}`}>
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
                        onClick={() => void handleSelectTemplate(template.id, template.type === "premium")}
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
