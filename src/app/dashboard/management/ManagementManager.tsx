"use client";

import { useState, useTransition, useRef } from "react";
import { createManagementMember, updateManagementMember, deleteManagementMember } from "../../actions/community";

export default function ManagementManager({ initialMembers }: { initialMembers: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleEditClick = (member: any) => {
    setEditingMember(member);
    setIsFormVisible(true);
    setMessage(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleAddNewClick = () => {
    setEditingMember(null);
    setIsFormVisible(true);
    setMessage(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus pengurus "${name}"?`)) return;
    startTransition(async () => {
      setMessage(null);
      const res = await deleteManagementMember(id);
      if (res.error) setMessage({ text: res.error, type: "error" });
      else setMessage({ text: "Berhasil menghapus data pengurus.", type: "success" });
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      
      // Sanitasi tipe data
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
      setMessage(null);
      const res = editingMember ? await updateManagementMember(submitData) : await createManagementMember(submitData);
      
      if (res.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setMessage({ text: `Berhasil ${editingMember ? "memperbarui" : "menambah"} data pengurus.`, type: "success" });
        setIsFormVisible(false);
        setEditingMember(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* BAGIAN TABEL */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Daftar Pengurus</h3>
          <button onClick={handleAddNewClick} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Tambah Pengurus Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-white text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 font-medium w-16 text-center">Urutan</th>
                <th className="px-5 py-3 font-medium">Nama & Jabatan</th>
                <th className="px-5 py-3 font-medium">Kontak (WA)</th>
                <th className="px-5 py-3 font-medium text-center">Status Publikasi</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialMembers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-gray-500 text-center bg-gray-50/50">Belum ada pengurus terdaftar.</td></tr>
              ) : (
                initialMembers.sort((a,b) => a.sort_order - b.sort_order).map((member) => (
                  <tr key={member.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-5 py-4 text-center font-semibold text-gray-400">{member.sort_order}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{member.full_name}</p>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">{member.role_title}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-mono text-xs">{member.phone_whatsapp || "-"}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${member.show_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {member.show_public ? "Tampil di Web" : "Disembunyikan"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(member)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium border border-blue-200 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(member.id, member.full_name)} disabled={isPending} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium border border-red-200 transition-colors disabled:opacity-50">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {message && !isFormVisible && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* BAGIAN FORM ENTRY */}
      {isFormVisible && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">{editingMember ? "Edit Data Pengurus" : "Tambah Pengurus Baru"}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{editingMember ? `ID: #${editingMember.id} | Mengubah profil takmir.` : "Lengkapi detail profil pengurus."}</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form key={editingMember ? editingMember.id : "new-member"} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" name="full_name" defaultValue={editingMember?.full_name} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Dr. H. Fulan, M.Ag" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jabatan / Peran <span className="text-red-500">*</span></label>
                <input type="text" name="role_title" defaultValue={editingMember?.role_title} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Ketua Takmir, Penasihat, dll" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp (Opsional)</label>
                <input type="text" name="phone_whatsapp" defaultValue={editingMember?.phone_whatsapp} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: 081234567890" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Foto Profil (Opsional)</label>
                <input type="url" name="profile_image_url" defaultValue={editingMember?.profile_image_url} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Visibilitas Publik <span className="text-red-500">*</span></label>
                <select name="show_public" defaultValue={editingMember ? String(editingMember.show_public) : "true"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="true">Tampilkan di Website Jamaah</option>
                  <option value="false">Sembunyikan (Hanya Internal)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">Atur apakah profil ini bisa dilihat pengunjung website.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan Tampil (Sort Order) <span className="text-red-500">*</span></label>
                <input type="number" name="sort_order" defaultValue={editingMember?.sort_order ?? 0} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: 1" />
                <p className="text-[10px] text-gray-500 mt-1">Angka lebih kecil akan tampil paling atas (Ketua = 1, Wakil = 2, dst).</p>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
              <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-500 hover:bg-gray-100 text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors">Batal</button>
              <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
                {isPending ? "Menyimpan..." : (editingMember ? "Simpan Perubahan" : "Simpan Pengurus")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}