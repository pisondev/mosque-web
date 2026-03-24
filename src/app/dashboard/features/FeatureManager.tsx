"use client";

import { useState, useTransition, useRef } from "react";
import { updateWebsiteFeature } from "../../actions/engagement";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useToast } from "../../../components/ui/Toast";
import { Edit3, Save, X, Settings2, ShieldCheck, AlertCircle } from "lucide-react";

export default function FeatureManager({ mergedFeatures }: { mergedFeatures: any[] }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  
  const [editingFeature, setEditingFeature] = useState<any | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleEditClick = (feature: any) => {
    setEditingFeature(feature);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  // Quick Action untuk mengaktifkan/mematikan fitur dari tabel langsung
  const handleQuickToggle = (feature: any, newEnabledValue: string) => {
    const isEnabled = newEnabledValue === 'true';
    
    startTransition(async () => {
      // Pertahankan nilai yang lama untuk is_active, detail, dan note
      const payload = {
        enabled: isEnabled,
        is_active: feature.is_active, 
        detail: feature.detail,
        note: feature.note
      };
      
      const submitData = new FormData();
      submitData.append("payload", JSON.stringify(payload));
      
      const res = await updateWebsiteFeature(feature.feature_id, submitData);
      if (res.error) addToast("Gagal memperbarui status fasilitas", "error");
      else addToast(`Status ${feature.name} berhasil diperbarui!`, "success");
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      if (key === 'enabled' || key === 'is_active') {
        payload[key] = value === 'true';
      } else {
        payload[key] = value;
      }
    }

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      const res = await updateWebsiteFeature(editingFeature.feature_id, submitData);
      
      if (res.error) {
        addToast(res.error, "error");
      } else {
        addToast(`Detail fasilitas ${editingFeature.name} berhasil disimpan!`, "success");
        setEditingFeature(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* ========================================= */}
      {/* BAGIAN TABEL DAFTAR FITUR */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Katalog Layanan & Fasilitas</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daftar inventaris standar yang akan ditampilkan di web jamaah.</p>
          </div>
        </div>

        <div className="overflow-x-auto pb-24">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] w-24">Kategori</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Nama Fasilitas / Layanan</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Kondisi Detail</th>
                <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px] w-40">Status Kepemilikan</th>
                <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mergedFeatures.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Katalog fitur kosong. Hubungi Superadmin.</td></tr>
              ) : (
                mergedFeatures.sort((a,b) => a.feature_type.localeCompare(b.feature_type)).map((item) => (
                  <tr key={item.feature_id} className={`hover:bg-emerald-50/30 transition-colors group h-16 ${!item.enabled && 'bg-gray-50/10 opacity-70'}`}>
                    <td className="px-5 py-3">
                      <span className={`inline-block w-20 text-center px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-sm
                        ${item.feature_type === 'facility' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                        {item.feature_type === 'facility' ? 'Fasilitas' : 'Layanan'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.category_label || "-"}</p>
                    </td>
                    <td className="px-5 py-3">
                      {item.enabled ? (
                        <>
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 ${item.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {item.is_active ? <><ShieldCheck className="w-3.5 h-3.5"/> Berfungsi</> : <><AlertCircle className="w-3.5 h-3.5"/> Rusak / Nonaktif</>}
                          </div>
                          <p className="text-xs text-gray-600 truncate max-w-[200px]">{item.detail || <span className="italic text-gray-400">Tanpa detail spesifik</span>}</p>
                        </>
                      ) : (
                        <span className="text-gray-300 text-xs italic">- Kosong -</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                       {/* Quick Toggle Status Kepemilikan */}
                       <div className="w-full min-w-[140px]">
                        <CustomSelect
                          name={`enabled-${item.feature_id}`}
                          defaultValue={String(item.enabled)}
                          disabled={isPending}
                          onChange={(val) => handleQuickToggle(item, val)}
                          options={[
                            { label: "✓ Dimiliki", value: "true" },
                            { label: "X Tidak Ada", value: "false" }
                          ]}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleEditClick(item)} disabled={isPending} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm disabled:opacity-50" title="Atur Detail">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* FORM EDIT STATUS (MUNCUL SAAT KLIK EDIT) */}
      {/* ========================================= */}
      {editingFeature && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-300" /> Atur: {editingFeature.name}
              </h3>
              <p className="text-emerald-200 text-xs mt-0.5">Kategori: {editingFeature.feature_type === 'facility' ? 'Fasilitas Fisik Bangunan' : 'Layanan Rutin Masjid'}</p>
            </div>
            <button type="button" onClick={() => setEditingFeature(null)} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6 p-6 bg-gray-50/80 border border-gray-100 rounded-xl">
                <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Status Operasional</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Apakah Masjid Memiliki Fitur Ini? <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="enabled" 
                    defaultValue={String(editingFeature.enabled)} 
                    disabled={isPending}
                    options={[
                      { label: "Ya, Memiliki (Tampilkan)", value: "true" },
                      { label: "Tidak (Sembunyikan dari Publik)", value: "false" }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kondisi Saat Ini <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="is_active" 
                    defaultValue={String(editingFeature.is_active)} 
                    disabled={isPending}
                    options={[
                      { label: "🟢 Aktif / Bisa Digunakan", value: "true" },
                      { label: "🔴 Sedang Rusak / Nonaktif", value: "false" }
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-6 pt-2 md:pt-0">
                <h4 className="text-xs font-bold tracking-widest text-emerald-800 uppercase mb-2">Informasi Tambahan</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Singkat (Opsional)</label>
                  <input type="text" name="detail" defaultValue={editingFeature.detail} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm disabled:bg-gray-100" placeholder="Cth: Tersedia 2 unit AC 2PK di ruang utama..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan (Internal/Publik)</label>
                  <textarea name="note" defaultValue={editingFeature.note} rows={4} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm disabled:bg-gray-100" placeholder="Cth: Hanya dinyalakan saat salat jumat dan pengajian akbar..."></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 gap-3 mt-4">
              <button type="button" onClick={() => setEditingFeature(null)} disabled={isPending} className="text-gray-500 hover:bg-gray-100 text-sm font-bold py-2.5 px-6 rounded-lg transition-colors border border-transparent">
                Batal
              </button>
              <button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
                {isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> Simpan Perubahan</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}