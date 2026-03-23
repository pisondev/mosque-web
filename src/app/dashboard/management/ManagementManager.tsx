"use client";

import { useState, useTransition, useRef } from "react";
import { createManagementMember, updateManagementMember, deleteManagementMember } from "../../actions/community";
import CustomSelect from "../../../components/ui/CustomSelect";
import { CopyToClipboard } from "../../../components/ui/InteractiveText";
import { useToast } from "../../../components/ui/Toast";
import { Plus, Edit3, Trash2, Save, X, ChevronDown } from "lucide-react";

export default function ManagementManager({ initialMembers }: { initialMembers: any[] }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const formRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const handleEditClick = (member: any) => {
    setEditingMember(member);
    setIsFormVisible(true);
    setValidationErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleAddNewClick = () => {
    setEditingMember(null);
    setIsFormVisible(true);
    setValidationErrors({});
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus pengurus "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteManagementMember(id);
      if (res.error) addToast(res.error, "error");
      else addToast(`Pengurus ${name} berhasil dihapus.`, "success");
    });
  };

  // Quick Action: Ubah Status Langsung dari Tabel
  const handleQuickStatusChange = (member: any, newStatusStr: string) => {
    const isPublic = newStatusStr === "true";
    startTransition(async () => {
      const payload = { ...member, show_public: isPublic };
      const submitData = new FormData();
      submitData.append("payload", JSON.stringify(payload));
      
      const res = await updateManagementMember(submitData);
      if (res.error) {
        addToast("Gagal memperbarui status", "error");
      } else {
        addToast(`Status ${member.full_name} diperbarui!`, "success");
      }
    });
  };

  // Submit Handler dengan Custom Validation
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};
    const errors: Record<string, string> = {};

    let hasError = false;

    // Manual Validation
    const fullName = formData.get("full_name") as string;
    if (!fullName || !fullName.trim()) { errors.full_name = "Nama lengkap harus diisi."; hasError = true; }
    
    const roleTitle = formData.get("role_title") as string;
    if (!roleTitle || !roleTitle.trim()) { errors.role_title = "Jabatan atau peran harus diisi."; hasError = true; }
    
    const sortOrderStr = formData.get("sort_order") as string;
    if (!sortOrderStr || !sortOrderStr.trim()) { errors.sort_order = "Urutan tampil wajib diisi (angka)."; hasError = true; }

    if (hasError) {
      setValidationErrors(errors);
      addToast("Mohon lengkapi kolom yang wajib diisi.", "error");
      return;
    }

    setValidationErrors({}); // Bersihkan error jika lolos

    // Parsing Payload
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      
      if (key === 'sort_order') {
        payload[key] = parseInt(value as string, 10) || 0;
      } else if (key === 'show_public') {
        payload[key] = value === 'true';
      } else {
        payload[key] = value;
      }
    }

    if (editingMember) payload.id = editingMember.id;
    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      const res = editingMember ? await updateManagementMember(submitData) : await createManagementMember(submitData);
      
      if (res.error) {
        addToast(res.error, "error");
      } else {
        addToast(`Berhasil ${editingMember ? "memperbarui" : "menambah"} data pengurus.`, "success");
        setIsFormVisible(false);
        setEditingMember(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* ========================================= */}
      {/* BAGIAN TABEL */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Daftar Pengurus</h3>
            <p className="text-xs text-gray-500 mt-0.5">Urutan struktur takmir yang ditampilkan ke publik.</p>
          </div>
          <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
            <Plus className="w-4 h-4" />
            Tambah Pengurus
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold w-16 text-center uppercase tracking-wider text-[11px]">No.</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Nama & Jabatan</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Kontak (WA)</th>
                <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px]">Status Publikasi</th>
                <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialMembers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada pengurus terdaftar.</td></tr>
              ) : (
                initialMembers.sort((a,b) => a.sort_order - b.sort_order).map((member) => (
                  <tr key={member.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-5 py-4 text-center font-bold text-gray-400">{member.sort_order}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{member.full_name}</p>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">{member.role_title}</p>
                    </td>
                    <td className="px-5 py-4">
                      {member.phone_whatsapp ? (
                        <CopyToClipboard text={member.phone_whatsapp} display={member.phone_whatsapp} />
                      ) : (
                        <span className="text-gray-400 text-xs italic">- Kosong -</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {/* QUICK ACTION DROPDOWN */}
                      <div className="relative inline-block w-36">
                        <select
                          disabled={isPending}
                          value={String(member.show_public)}
                          onChange={(e) => handleQuickStatusChange(member, e.target.value)}
                          className={`w-full appearance-none text-[10px] font-bold px-3 py-1.5 rounded-full cursor-pointer outline-none border transition-colors ${
                            member.show_public 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <option value="true">Tampil di Web</option>
                          <option value="false">Sembunyikan</option>
                        </select>
                        <ChevronDown className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${member.show_public ? "text-emerald-500" : "text-gray-400"}`} />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(member)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(member.id, member.full_name)} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* BAGIAN FORM ENTRY */}
      {/* ========================================= */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-white px-6 md:px-8 py-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{editingMember ? "Edit Profil Pengurus" : "Tambah Pengurus Baru"}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{editingMember ? `Menyunting data ID #${editingMember.id}` : "Lengkapi formulir di bawah ini."}</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full border border-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form menggunakan noValidate agar kita bisa pakai custom error UI */}
          <form key={editingMember ? editingMember.id : "new-member"} onSubmit={handleSubmit} noValidate className="p-6 md:p-8 space-y-8">
            
            {/* Blok Data Diri */}
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5">Data Profil</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap <span className="text-rose-500">*</span></label>
                  <input type="text" name="full_name" defaultValue={editingMember?.full_name} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 focus:ring-2 outline-none transition-colors ${validationErrors.full_name ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"}`} placeholder="Cth: Dr. H. Fulan, M.Ag" />
                  {validationErrors.full_name && <p className="text-rose-500 text-[10px] mt-1.5 font-medium animate-in fade-in">{validationErrors.full_name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jabatan / Peran <span className="text-rose-500">*</span></label>
                  <input type="text" name="role_title" defaultValue={editingMember?.role_title} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 focus:ring-2 outline-none transition-colors ${validationErrors.role_title ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"}`} placeholder="Cth: Ketua Takmir, Penasihat, dll" />
                  {validationErrors.role_title && <p className="text-rose-500 text-[10px] mt-1.5 font-medium animate-in fade-in">{validationErrors.role_title}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp (Opsional)</label>
                  <input type="text" name="phone_whatsapp" defaultValue={editingMember?.phone_whatsapp} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Cth: 081234567890" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Foto Profil (Opsional)</label>
                  <input type="url" name="profile_image_url" defaultValue={editingMember?.profile_image_url} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* Blok Konfigurasi Tampilan */}
            <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-8 border-t border-b border-gray-100">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5">Pengaturan Tampilan Publik</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Visibilitas Publik <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="show_public"
                    defaultValue={editingMember ? String(editingMember.show_public) : "true"}
                    options={[
                      { label: "Tampilkan di Website Jamaah", value: "true" },
                      { label: "Sembunyikan (Hanya Internal)", value: "false" }
                    ]}
                  />
                  <p className="text-[10px] text-gray-500 mt-2">Atur apakah profil ini bisa dilihat oleh pengunjung website jamaah.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan Tampil (Sort Order) <span className="text-rose-500">*</span></label>
                  <input type="number" name="sort_order" defaultValue={editingMember?.sort_order ?? 0} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 focus:ring-2 outline-none transition-colors ${validationErrors.sort_order ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"}`} placeholder="Cth: 1" />
                  {validationErrors.sort_order && <p className="text-rose-500 text-[10px] mt-1.5 font-medium animate-in fade-in">{validationErrors.sort_order}</p>}
                  <p className="text-[10px] text-gray-500 mt-2">Angka lebih kecil akan tampil paling atas (Ketua = 1, Wakil = 2, dst).</p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsFormVisible(false)} className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 font-semibold py-2.5 px-5 rounded-lg transition-colors border border-transparent">
                Batal
              </button>
              <button type="submit" disabled={isPending} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm active:scale-95">
                {isPending ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan Pengurus</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}