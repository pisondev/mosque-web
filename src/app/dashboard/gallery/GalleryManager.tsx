"use client";

import { useState, useTransition, useRef } from "react";
import { 
  createGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum,
  createGalleryItem, updateGalleryItem, deleteGalleryItem 
} from "../../actions/community";

export default function GalleryManager({ initialAlbums, initialItems }: { initialAlbums: any[], initialItems: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // Tab Management
  const [activeTab, setActiveTab] = useState<"albums" | "items">("albums");
  
  // Form State
  const [editingData, setEditingData] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
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

  const handleDelete = (id: number, title: string, type: "album" | "item") => {
    if (!window.confirm(`Yakin ingin menghapus ${type === "album" ? "Album" : "Media"} "${title}"?`)) return;
    startTransition(async () => {
      setMessage(null);
      const res = type === "album" ? await deleteGalleryAlbum(id) : await deleteGalleryItem(id);
      if (res.error) setMessage({ text: res.error, type: "error" });
      else setMessage({ text: `Berhasil menghapus ${type}.`, type: "success" });
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      
      // Sanitasi & Parsing
      if (key === 'sort_order' || key === 'album_id') {
        payload[key] = parseInt(value as string, 10);
      } else if (key === 'is_highlight') {
        payload[key] = value === 'true';
      } else if (key === 'taken_at') {
        // Konversi datetime-local HTML ke RFC3339 untuk backend Go
        payload[key] = new Date(value as string).toISOString();
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
      if (activeTab === "albums") {
        res = editingData ? await updateGalleryAlbum(submitData) : await createGalleryAlbum(submitData);
      } else {
        res = editingData ? await updateGalleryItem(submitData) : await createGalleryItem(submitData);
      }
      
      if (res.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setMessage({ text: `Berhasil ${editingData ? "memperbarui" : "menambah"} data.`, type: "success" });
        setIsFormVisible(false);
        setEditingData(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  // Ubah Tab = Reset Form
  const switchTab = (tab: "albums" | "items") => {
    setActiveTab(tab);
    setIsFormVisible(false);
    setEditingData(null);
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigator */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => switchTab("albums")} className={`py-3 px-6 text-sm font-semibold transition-colors border-b-2 ${activeTab === "albums" ? "bg-white text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          1. Manajemen Album
        </button>
        <button onClick={() => switchTab("items")} className={`py-3 px-6 text-sm font-semibold transition-colors border-b-2 ${activeTab === "items" ? "bg-white text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          2. Manajemen Media (Foto / Video)
        </button>
      </div>

      {message && !isFormVisible && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 1: ALBUMS */}
      {/* ==================================================== */}
      {activeTab === "albums" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Daftar Album</h3>
            <button onClick={handleAddNewClick} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Buat Album Baru
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-medium w-16 text-center">ID</th>
                  <th className="px-5 py-3 font-medium">Judul Album</th>
                  <th className="px-5 py-3 font-medium">Jenis Media</th>
                  <th className="px-5 py-3 font-medium">Rentang Waktu</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialAlbums.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-gray-500 text-center bg-gray-50/50">Belum ada album.</td></tr>
                ) : (
                  initialAlbums.map((album) => (
                    <tr key={album.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 text-center text-gray-400 font-mono">#{album.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{album.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{album.description || "-"}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-700 capitalize">{album.media_kind}</td>
                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {album.start_date || "?"} s/d {album.end_date || "?"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(album)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium border border-blue-200">Edit</button>
                          <button onClick={() => handleDelete(album.id, album.title, "album")} disabled={isPending} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium border border-red-200">Hapus</button>
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
      {/* MODE 2: MEDIA ITEMS */}
      {/* ==================================================== */}
      {activeTab === "items" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Daftar Foto & Video</h3>
            <button onClick={handleAddNewClick} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Unggah Media Baru
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-medium w-16">Tipe</th>
                  <th className="px-5 py-3 font-medium">Pratinjau / Tautan</th>
                  <th className="px-5 py-3 font-medium">Album Induk</th>
                  <th className="px-5 py-3 font-medium">Highlight?</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialItems.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-gray-500 text-center bg-gray-50/50">Belum ada media terdaftar.</td></tr>
                ) : (
                  initialItems.sort((a,b) => a.sort_order - b.sort_order).map((item) => {
                    const parentAlbum = initialAlbums.find(a => a.id === item.album_id);
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-1 text-[10px] rounded font-semibold uppercase ${item.media_type === 'video' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.media_type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {item.media_type === 'image' ? (
                            <div className="flex items-center gap-3">
                              <img src={item.media_url} alt="thumbnail" className="w-10 h-10 object-cover rounded border border-gray-200 bg-gray-100" />
                              <p className="text-xs text-gray-600 truncate max-w-xs">{item.caption || "Tanpa Keterangan"}</p>
                            </div>
                          ) : (
                            <a href={item.media_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline truncate max-w-xs block">{item.media_url}</a>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-gray-900 font-medium">{parentAlbum ? parentAlbum.title : <span className="text-red-500 italic">Tanpa Album</span>}</span>
                        </td>
                        <td className="px-5 py-4">
                          {item.is_highlight && <span className="text-yellow-500 font-bold text-lg">★</span>}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(item)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium border border-blue-200">Edit</button>
                            <button onClick={() => handleDelete(item.id, `Media #${item.id}`, "item")} disabled={isPending} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium border border-red-200">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FORM ENTRY (BISA UNTUK ALBUM ATAU ITEM) */}
      {/* ==================================================== */}
      {isFormVisible && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">
                {editingData ? "Edit " : "Tambah "} 
                {activeTab === "albums" ? "Album" : "Media (Foto/Video)"}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">{editingData ? `ID: #${editingData.id}` : "Lengkapi formulir di bawah ini."}</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form key={editingData ? editingData.id : "new"} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            
            {/* INPUT UNTUK ALBUM */}
            {activeTab === "albums" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Album <span className="text-red-500">*</span></label>
                    <input type="text" name="title" defaultValue={editingData?.title} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Dokumentasi Idul Adha 1447H" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis Media di Dalamnya <span className="text-red-500">*</span></label>
                    <select name="media_kind" defaultValue={editingData?.media_kind || "photo"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none">
                      <option value="photo">Hanya Foto (Photo)</option>
                      <option value="video">Hanya Video (Video)</option>
                      <option value="mix">Campuran (Mix)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Mulai Kegiatan (Opsional)</label>
                    <input type="date" name="start_date" defaultValue={editingData?.start_date} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Selesai (Opsional)</label>
                    <input type="date" name="end_date" defaultValue={editingData?.end_date} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Album (Opsional)</label>
                  <textarea name="description" defaultValue={editingData?.description} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" placeholder="Penjelasan singkat mengenai album..."></textarea>
                </div>
              </>
            )}

            {/* INPUT UNTUK MEDIA ITEM */}
            {activeTab === "items" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pilih Album Induk</label>
                    <select name="album_id" defaultValue={editingData?.album_id || ""} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none">
                      <option value="">-- Tanpa Album (Bebas) --</option>
                      {initialAlbums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipe Media <span className="text-red-500">*</span></label>
                    <select name="media_type" defaultValue={editingData?.media_type || "image"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none">
                      <option value="image">Gambar / Foto (Image)</option>
                      <option value="video">Tautan Video (Video)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Media (Link Gambar / Video) <span className="text-red-500">*</span></label>
                    <input type="url" name="media_url" defaultValue={editingData?.media_url} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Keterangan Foto (Caption)</label>
                    <input type="text" name="caption" defaultValue={editingData?.caption} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" placeholder="Cth: Suasana salat ied..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Waktu Pengambilan (Opsional)</label>
                    <input type="datetime-local" name="taken_at" defaultValue={editingData?.taken_at ? new Date(editingData.taken_at).toISOString().slice(0, 16) : ""} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Lokasi (Opsional)</label>
                    <input type="text" name="location_note" defaultValue={editingData?.location_note} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" placeholder="Cth: Halaman Utama Masjid" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jadikan Highlight? <span className="text-red-500">*</span></label>
                      <select name="is_highlight" defaultValue={editingData ? String(editingData.is_highlight) : "false"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white outline-none">
                        <option value="false">Tidak Biasa Saja</option>
                        <option value="true">Ya, Bintang Utama</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan (Sort) <span className="text-red-500">*</span></label>
                      <input type="number" name="sort_order" defaultValue={editingData?.sort_order ?? 0} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BUTTON SUBMIT */}
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
              <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-500 hover:bg-gray-100 text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors">Batal</button>
              <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95">
                {isPending ? "Menyimpan..." : (editingData ? "Simpan Perubahan" : "Simpan Data")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}