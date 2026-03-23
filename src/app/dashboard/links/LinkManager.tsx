"use client";

import { useState, useTransition, useRef } from "react";
import { 
  createSocialLink, updateSocialLink, deleteSocialLink,
  createExternalLink, updateExternalLink, deleteExternalLink 
} from "../../actions/engagement";

export default function LinkManager({ initialSocial, initialExternal }: { initialSocial: any[], initialExternal: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // Tab Management: "social" | "external"
  const [activeTab, setActiveTab] = useState<"social" | "external">("social");
  
  const [editingData, setEditingData] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleAddNewClick = () => {
    setEditingData(null);
    setIsFormVisible(true);
    setMessage(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleEditClick = (data: any) => {
    setEditingData(data);
    setIsFormVisible(true);
    setMessage(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = (id: number, label: string, type: "social" | "external") => {
    if (!window.confirm(`Yakin ingin menghapus tautan "${label}"?`)) return;
    startTransition(async () => {
      setMessage(null);
      const res = type === "social" ? await deleteSocialLink(id) : await deleteExternalLink(id);
      if (res.error) setMessage({ text: res.error, type: "error" });
      else setMessage({ text: `Berhasil menghapus tautan.`, type: "success" });
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      
      // Sanitasi
      if (key === 'sort_order') {
        payload[key] = parseInt(value as string, 10) || 0;
      } else if (key === 'show_in_footer' || key === 'show_in_contact_page') {
        payload[key] = value === 'true';
      } else {
        payload[key] = value;
      }
    }

    if (editingData) payload.id = editingData.id;
    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      setMessage(null);
      let res;
      if (activeTab === "social") {
        res = editingData ? await updateSocialLink(submitData) : await createSocialLink(submitData);
      } else {
        res = editingData ? await updateExternalLink(submitData) : await createExternalLink(submitData);
      }
      
      if (res.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setMessage({ text: `Berhasil ${editingData ? "memperbarui" : "menambah"} tautan.`, type: "success" });
        setIsFormVisible(false);
        setEditingData(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const switchTab = (tab: "social" | "external") => {
    setActiveTab(tab);
    setIsFormVisible(false);
    setEditingData(null);
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigator */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => switchTab("social")} className={`py-3 px-6 text-sm font-semibold transition-colors border-b-2 ${activeTab === "social" ? "bg-white text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          1. Media Sosial
        </button>
        <button onClick={() => switchTab("external")} className={`py-3 px-6 text-sm font-semibold transition-colors border-b-2 ${activeTab === "external" ? "bg-white text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          2. Tautan Eksternal Khusus
        </button>
      </div>

      {message && !isFormVisible && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 1: SOCIAL LINKS */}
      {/* ==================================================== */}
      {activeTab === "social" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Daftar Akun Media Sosial</h3>
            <button onClick={handleAddNewClick} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Tambah Akun Baru
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-medium">Platform & Akun</th>
                  <th className="px-5 py-3 font-medium">Tautan (URL)</th>
                  <th className="px-5 py-3 font-medium text-center">Tampil di Footer</th>
                  <th className="px-5 py-3 font-medium text-center">Tampil di Kontak</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialSocial.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-gray-500 text-center bg-gray-50/50">Belum ada tautan media sosial.</td></tr>
                ) : (
                  initialSocial.sort((a,b) => a.sort_order - b.sort_order).map((link) => (
                    <tr key={link.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 capitalize">{link.platform}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{link.account_name || "-"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline truncate max-w-[200px] block">{link.url}</a>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {link.show_in_footer ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {link.show_in_contact_page ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(link)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium border border-blue-200">Edit</button>
                          <button onClick={() => handleDelete(link.id, link.platform, "social")} disabled={isPending} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium border border-red-200">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: EXTERNAL LINKS */}
      {/* ==================================================== */}
      {activeTab === "external" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Daftar Tautan Eksternal</h3>
            <button onClick={handleAddNewClick} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Tambah Tautan Baru
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-medium">Label / Teks Link</th>
                  <th className="px-5 py-3 font-medium">Jenis Tautan</th>
                  <th className="px-5 py-3 font-medium">Tautan (URL)</th>
                  <th className="px-5 py-3 font-medium text-center">Visibilitas</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialExternal.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-gray-500 text-center bg-gray-50/50">Belum ada tautan eksternal.</td></tr>
                ) : (
                  initialExternal.sort((a,b) => a.sort_order - b.sort_order).map((link) => (
                    <tr key={link.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 font-semibold text-gray-900">{link.label}</td>
                      <td className="px-5 py-4 text-gray-700 capitalize">{link.link_type}</td>
                      <td className="px-5 py-4">
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline truncate max-w-[200px] block">{link.url}</a>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${link.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {link.visibility === 'public' ? "Publik" : "Tersembunyi"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(link)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium border border-blue-200">Edit</button>
                          <button onClick={() => handleDelete(link.id, link.label, "external")} disabled={isPending} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium border border-red-200">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FORM ENTRY BERSAMA */}
      {/* ==================================================== */}
      {isFormVisible && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">
                {editingData ? "Edit " : "Tambah "} 
                {activeTab === "social" ? "Media Sosial" : "Tautan Eksternal"}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">{editingData ? `ID: #${editingData.id}` : "Lengkapi formulir di bawah ini."}</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form key={editingData ? editingData.id : "new"} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            
            {/* INPUT UNTUK SOCIAL LINKS */}
            {activeTab === "social" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Platform <span className="text-red-500">*</span></label>
                    <select name="platform" defaultValue={editingData?.platform || "instagram"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="tiktok">TikTok</option>
                      <option value="whatsapp">WhatsApp Channel</option>
                      <option value="telegram">Telegram</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Akun (Opsional)</label>
                    <input type="text" name="account_name" defaultValue={editingData?.account_name} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: @masjidku" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL / Link Tautan <span className="text-red-500">*</span></label>
                    <input type="url" name="url" defaultValue={editingData?.url} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://instagram.com/..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-100 pt-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tampil di Footer Web <span className="text-red-500">*</span></label>
                      <select name="show_in_footer" defaultValue={editingData ? String(editingData.show_in_footer) : "true"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none">
                        <option value="true">Ya, Tampilkan</option><option value="false">Sembunyikan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tampil di Halaman Kontak <span className="text-red-500">*</span></label>
                      <select name="show_in_contact_page" defaultValue={editingData ? String(editingData.show_in_contact_page) : "true"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none">
                        <option value="true">Ya, Tampilkan</option><option value="false">Sembunyikan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan Tampil (Sort) <span className="text-red-500">*</span></label>
                      <input type="number" name="sort_order" defaultValue={editingData?.sort_order ?? 0} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Keterangan Tambahan (Opsional)</label>
                    <textarea name="description" defaultValue={editingData?.description} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Akun resmi khusus streaming kajian..."></textarea>
                  </div>
                </div>
              </>
            )}

            {/* INPUT UNTUK EXTERNAL LINKS */}
            {activeTab === "external" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Label / Teks Link <span className="text-red-500">*</span></label>
                    <input type="text" name="label" defaultValue={editingData?.label} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" placeholder="Cth: Formulir Qurban 2026" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis Tautan <span className="text-red-500">*</span></label>
                    <select name="link_type" defaultValue={editingData?.link_type || "form"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none">
                      <option value="form">Formulir (GForm/Typeform)</option>
                      <option value="app">Aplikasi Pihak Ketiga</option>
                      <option value="doc">Dokumen Luar (Drive/PDF)</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL / Link Tujuan <span className="text-red-500">*</span></label>
                    <input type="url" name="url" defaultValue={editingData?.url} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" placeholder="https://docs.google.com/..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-100 pt-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Visibilitas <span className="text-red-500">*</span></label>
                      <select name="visibility" defaultValue={editingData?.visibility || "public"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none">
                        <option value="public">Publik</option>
                        <option value="hidden">Sembunyikan Sementara</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan (Sort) <span className="text-red-500">*</span></label>
                      <input type="number" name="sort_order" defaultValue={editingData?.sort_order ?? 0} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Internal (Opsional)</label>
                    <textarea name="note" defaultValue={editingData?.note} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-yellow-50 outline-none" placeholder="Catatan untuk pengurus (tidak tampil di publik)..."></textarea>
                  </div>
                </div>
              </>
            )}

            {/* BUTTON SUBMIT */}
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
              <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-500 hover:bg-gray-100 text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors">Batal</button>
              <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95">
                {isPending ? "Menyimpan..." : (editingData ? "Simpan Perubahan" : "Simpan Tautan")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}