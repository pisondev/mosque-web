"use client";

import { useState, useTransition, useRef } from "react";
import { 
  createSocialLink, updateSocialLink, deleteSocialLink,
  createExternalLink, updateExternalLink, deleteExternalLink 
} from "../../actions/engagement";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useToast } from "../../../components/ui/Toast";
import { useDecisionModal } from "../../../components/ui/DecisionModalProvider";
import { CopyToClipboard, ConfirmRedirect } from "../../../components/ui/InteractiveText";
import { Plus, Edit3, Trash2, Save, X, ExternalLink, Hash } from "lucide-react";

export default function LinkManager({ initialSocial, initialExternal }: { initialSocial: any[], initialExternal: any[] }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const { confirm } = useDecisionModal();
  
  const [activeTab, setActiveTab] = useState<"social" | "external">("social");
  const [editingData, setEditingData] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleAddNewClick = () => {
    setEditingData(null);
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleEditClick = (data: any) => {
    setEditingData(data);
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = async (id: number, label: string, type: "social" | "external") => {
    const ok = await confirm({
      title: "Hapus tautan?",
      description: `Tautan "${label}" akan dihapus dari daftar.`,
      confirmLabel: "Hapus Tautan",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = type === "social" ? await deleteSocialLink(id) : await deleteExternalLink(id);
      if (res.error) addToast(res.error, "error");
      else addToast(`Berhasil menghapus tautan.`, "success");
    });
  };

  const handleQuickStatusChange = (item: any, field: string, value: string, type: "social" | "external") => {
    startTransition(async () => {
      const payload = { ...item, [field]: value === 'true' || value === 'public' ? (field === 'visibility' ? 'public' : true) : (field === 'visibility' ? 'hidden' : false) };
      const submitData = new FormData();
      submitData.append("payload", JSON.stringify(payload));
      
      const res = type === "social" ? await updateSocialLink(submitData) : await updateExternalLink(submitData);
      
      if (res.error) addToast("Gagal memperbarui status", "error");
      else addToast(`Status diperbarui!`, "success");
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      if (key === 'sort_order') { payload[key] = parseInt(value as string, 10) || 0; } 
      else if (key === 'show_in_footer' || key === 'show_in_contact_page') { payload[key] = value === 'true'; } 
      else { payload[key] = value; }
    }

    if (editingData) payload.id = editingData.id;
    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      let res;
      if (activeTab === "social") res = editingData ? await updateSocialLink(submitData) : await createSocialLink(submitData);
      else res = editingData ? await updateExternalLink(submitData) : await createExternalLink(submitData);
      
      if (res.error) addToast(res.error, "error");
      else {
        addToast(`Berhasil ${editingData ? "memperbarui" : "menambah"} tautan.`, "success");
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
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigator */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => switchTab("social")} className={`py-3 px-6 text-sm font-semibold transition-colors border-b-2 ${activeTab === "social" ? "bg-white text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          Media Sosial
        </button>
        <button onClick={() => switchTab("external")} className={`py-3 px-6 text-sm font-semibold transition-colors border-b-2 ${activeTab === "external" ? "bg-white text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          Tautan Eksternal Khusus
        </button>
      </div>

      {/* TAB 1: SOCIAL LINKS */}
      {activeTab === "social" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
          <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800">Daftar Akun Media Sosial</h3>
              <p className="text-xs text-gray-500 mt-0.5">Tautan resmi masjid (Instagram, YouTube, dll).</p>
            </div>
            <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Tambah Akun
            </button>
          </div>
          
          <div className="overflow-x-auto pb-24">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Platform & Akun</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Tautan (URL)</th>
                  <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px] w-36">Tampil di Footer</th>
                  <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialSocial.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada tautan media sosial.</td></tr>
                ) : (
                  initialSocial.sort((a,b) => a.sort_order - b.sort_order).map((link) => (
                    <tr key={link.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900 capitalize flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-emerald-500"/> {link.platform}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{link.account_name || "-"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-[250px] overflow-hidden">
                           <ConfirmRedirect url={link.url} display="Kunjungi Halaman" />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <CustomSelect
                          name={`show_in_footer-${link.id}`}
                          defaultValue={String(link.show_in_footer)}
                          disabled={isPending}
                          onChange={(val) => handleQuickStatusChange(link, 'show_in_footer', val, 'social')}
                          options={[{ label: "Tampil", value: "true" }, { label: "Sembunyi", value: "false" }]}
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(link)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => void handleDelete(link.id, link.platform, "social")} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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

      {/* TAB 2: EXTERNAL LINKS */}
      {activeTab === "external" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
          <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800">Daftar Tautan Eksternal</h3>
              <p className="text-xs text-gray-500 mt-0.5">Formulir, GDrive, dan aplikasi pihak ketiga.</p>
            </div>
            <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Tambah Tautan
            </button>
          </div>
          
          <div className="overflow-x-auto pb-24">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Label / Judul</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Jenis / Tujuan</th>
                  <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px] w-36">Visibilitas</th>
                  <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialExternal.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada tautan eksternal.</td></tr>
                ) : (
                  initialExternal.sort((a,b) => a.sort_order - b.sort_order).map((link) => (
                    <tr key={link.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">{link.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">{link.link_type}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-[250px] overflow-hidden">
                           <CopyToClipboard text={link.url} display="Salin Link Tujuan" />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <CustomSelect
                          name={`visibility-${link.id}`}
                          defaultValue={link.visibility}
                          disabled={isPending}
                          onChange={(val) => handleQuickStatusChange(link, 'visibility', val, 'external')}
                          options={[{ label: "Publik", value: "public" }, { label: "Sembunyikan", value: "hidden" }]}
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(link)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => void handleDelete(link.id, link.label, "external")} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">
                {editingData ? "Edit " : "Tambah "} 
                {activeTab === "social" ? "Media Sosial" : "Tautan Eksternal"}
              </h3>
              <p className="text-emerald-200 text-xs mt-0.5">{editingData ? `ID: #${editingData.id}` : "Lengkapi formulir di bawah ini."}</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form key={editingData ? editingData.id : "new"} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {activeTab === "social" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Platform <span className="text-rose-500">*</span></label>
                    <CustomSelect 
                      name="platform" 
                      defaultValue={editingData?.platform || "instagram"} 
                      disabled={isPending}
                      options={[
                        {label: "Instagram", value: "instagram"}, {label: "Facebook", value: "facebook"},
                        {label: "YouTube", value: "youtube"}, {label: "Twitter / X", value: "twitter"},
                        {label: "TikTok", value: "tiktok"}, {label: "WhatsApp Channel", value: "whatsapp"},
                        {label: "Telegram", value: "telegram"}, {label: "Lainnya", value: "other"}
                      ]} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Akun (Opsional)</label>
                    <input type="text" name="account_name" defaultValue={editingData?.account_name} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm disabled:bg-gray-100" placeholder="Cth: @masjidku" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL / Link Tautan <span className="text-rose-500">*</span></label>
                    <input type="url" name="url" defaultValue={editingData?.url} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm disabled:bg-gray-100" placeholder="https://instagram.com/..." />
                  </div>
                </div>

                <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-6 border-t border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tampil di Footer Web <span className="text-rose-500">*</span></label>
                        <CustomSelect name="show_in_footer" defaultValue={editingData ? String(editingData.show_in_footer) : "true"} options={[{label: "Ya, Tampilkan", value: "true"}, {label: "Sembunyikan", value: "false"}]} disabled={isPending} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tampil di Halaman Kontak <span className="text-rose-500">*</span></label>
                        <CustomSelect name="show_in_contact_page" defaultValue={editingData ? String(editingData.show_in_contact_page) : "true"} options={[{label: "Ya, Tampilkan", value: "true"}, {label: "Sembunyikan", value: "false"}]} disabled={isPending} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan Tampil (Sort) <span className="text-rose-500">*</span></label>
                        <input type="number" name="sort_order" defaultValue={editingData?.sort_order ?? 0} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm disabled:bg-gray-100 bg-white" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Keterangan Tambahan (Opsional)</label>
                      <textarea name="description" defaultValue={editingData?.description} rows={5} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm bg-white disabled:bg-gray-100" placeholder="Cth: Akun resmi khusus streaming kajian..."></textarea>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "external" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Label / Teks Link <span className="text-rose-500">*</span></label>
                    <input type="text" name="label" defaultValue={editingData?.label} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm disabled:bg-gray-100" placeholder="Cth: Formulir Qurban 2026" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis Tautan <span className="text-rose-500">*</span></label>
                    <CustomSelect 
                      name="link_type" 
                      defaultValue={editingData?.link_type || "form"} 
                      disabled={isPending}
                      options={[
                        {label: "Formulir (GForm/Typeform)", value: "form"}, {label: "Aplikasi Pihak Ketiga", value: "app"},
                        {label: "Dokumen Luar (Drive/PDF)", value: "doc"}, {label: "Lainnya", value: "other"}
                      ]}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL / Link Tujuan <span className="text-rose-500">*</span></label>
                    <input type="url" name="url" defaultValue={editingData?.url} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm disabled:bg-gray-100" placeholder="https://docs.google.com/..." />
                  </div>
                </div>

                <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-6 border-t border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Visibilitas <span className="text-rose-500">*</span></label>
                        <CustomSelect name="visibility" defaultValue={editingData?.visibility || "public"} disabled={isPending} options={[{label: "Publik (Tampil)", value: "public"}, {label: "Sembunyikan", value: "hidden"}]} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan (Sort) <span className="text-rose-500">*</span></label>
                        <input type="number" name="sort_order" defaultValue={editingData?.sort_order ?? 0} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm disabled:bg-gray-100" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Internal (Opsional)</label>
                      <textarea name="note" defaultValue={editingData?.note} rows={4} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-gray-900 focus:ring-2 focus:ring-amber-200 outline-none shadow-sm disabled:opacity-70" placeholder="Catatan untuk pengurus (tidak tampil di publik)..."></textarea>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BUTTON SUBMIT */}
            <div className="flex justify-end pt-2 gap-3 mt-4">
              <button type="button" onClick={() => setIsFormVisible(false)} disabled={isPending} className="text-gray-500 hover:bg-gray-100 text-sm font-bold py-2.5 px-6 rounded-lg transition-colors border border-transparent">
                Batal
              </button>
              <button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
                {isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> {editingData ? "Simpan Perubahan" : "Simpan Tautan"}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
