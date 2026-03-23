"use client";

import { useState, useTransition, useRef } from "react";
import { updateWebsiteFeature } from "../../actions/engagement";

export default function FeatureManager({ mergedFeatures }: { mergedFeatures: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const [editingFeature, setEditingFeature] = useState<any | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleEditClick = (feature: any) => {
    setEditingFeature(feature);
    setMessage(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
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
      setMessage(null);
      // PUT request butuh feature_id
      const res = await updateWebsiteFeature(editingFeature.feature_id, submitData);
      
      if (res.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setMessage({ text: `Berhasil memperbarui fasilitas/layanan.`, type: "success" });
        setEditingFeature(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* BAGIAN TABEL DAFTAR FITUR */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Katalog Layanan & Fasilitas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-white text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 font-medium">Jenis</th>
                <th className="px-5 py-3 font-medium">Nama Fasilitas / Layanan</th>
                <th className="px-5 py-3 font-medium">Detail Tambahan</th>
                <th className="px-5 py-3 font-medium text-center">Status Kepemilikan</th>
                <th className="px-5 py-3 font-medium text-center">Sedang Aktif?</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mergedFeatures.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-gray-500 text-center bg-gray-50/50">Katalog fitur kosong. Hubungi Superadmin.</td></tr>
              ) : (
                mergedFeatures.sort((a,b) => a.feature_type.localeCompare(b.feature_type)).map((item) => (
                  <tr key={item.feature_id} className={`hover:bg-blue-50/30 transition-colors group ${!item.enabled && 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${item.feature_type === 'facility' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.feature_type === 'facility' ? 'Fasilitas' : 'Layanan'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.category_label || "-"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-600 truncate max-w-[200px]">{item.detail || "-"}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${item.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {item.enabled ? "Dimiliki" : "Tidak Ada"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {item.enabled ? (
                        <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${item.is_active ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {item.is_active ? "Bisa Dipakai" : "Rusak / Nonaktif"}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleEditClick(item)} className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-gray-200 hover:border-blue-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm">
                        Atur Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {message && !editingFeature && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* FORM EDIT STATUS */}
      {editingFeature && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">Atur {editingFeature.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5">Kategori: {editingFeature.feature_type === 'facility' ? 'Fasilitas Fisik' : 'Layanan Masjid'}</p>
            </div>
            <button type="button" onClick={() => setEditingFeature(null)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5 p-5 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Apakah Masjid Memiliki Fitur Ini? <span className="text-red-500">*</span></label>
                  <select name="enabled" defaultValue={String(editingFeature.enabled)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                    <option value="true">Ya, Memiliki</option>
                    <option value="false">Tidak (Sembunyikan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kondisi Saat Ini <span className="text-red-500">*</span></label>
                  <select name="is_active" defaultValue={String(editingFeature.is_active)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                    <option value="true">Aktif / Bisa Digunakan</option>
                    <option value="false">Sedang Rusak / Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Singkat (Opsional)</label>
                  <input type="text" name="detail" defaultValue={editingFeature.detail} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Tersedia 2 unit AC di ruang utama..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Tambahan (Opsional)</label>
                  <textarea name="note" defaultValue={editingFeature.note} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Hanya dinyalakan saat salat jumat..."></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 gap-3">
              <button type="button" onClick={() => setEditingFeature(null)} className="text-gray-500 hover:bg-gray-100 text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors">Batal</button>
              <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95">
                {isPending ? "Menyimpan..." : "Simpan Perubahan Status"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}