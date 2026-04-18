"use client";

import { useState, useTransition, useRef } from "react";
import { 
  createGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum,
  createGalleryItem, updateGalleryItem, deleteGalleryItem 
} from "../../actions/community";
import CustomSelect from "../../../components/ui/CustomSelect";
import CustomDateInput from "../../../components/ui/CustomDateInput";
import { useToast } from "../../../components/ui/Toast";
import { useDecisionModal } from "../../../components/ui/DecisionModalProvider";
import { ConfirmRedirect } from "../../../components/ui/InteractiveText";
import { formatDateID } from "../../../lib/utils";
import { Plus, Edit3, Trash2, Save, X, Image as ImageIcon, FolderOpen, Video, Camera, Star } from "lucide-react";

export default function GalleryManager({ initialAlbums, initialItems }: { initialAlbums: any[], initialItems: any[] }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const { confirm } = useDecisionModal();
  
  const [activeTab, setActiveTab] = useState<"albums" | "items">("albums");
  const [editingData, setEditingData] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
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

  const handleDelete = async (id: number, title: string, type: "album" | "item") => {
    const ok = await confirm({
      title: `Hapus ${type === "album" ? "album" : "media"}?`,
      description: `${type === "album" ? "Album" : "Media"} "${title}" akan dihapus dari galeri.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = type === "album" ? await deleteGalleryAlbum(id) : await deleteGalleryItem(id);
      if (res.error) addToast(res.error, "error");
      else addToast(`Berhasil menghapus ${type === "album" ? "Album" : "Media"}.`, "success");
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      if (key === 'sort_order' || key === 'album_id') {
        payload[key] = parseInt(value as string, 10);
      } else if (key === 'is_highlight') {
        payload[key] = value === 'true';
      } else if (key === 'taken_at') {
        payload[key] = new Date(value as string).toISOString();
      } else {
        payload[key] = value;
      }
    }

    if (editingData) payload.id = editingData.id;
    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      let res;
      if (activeTab === "albums") {
        res = editingData ? await updateGalleryAlbum(submitData) : await createGalleryAlbum(submitData);
      } else {
        res = editingData ? await updateGalleryItem(submitData) : await createGalleryItem(submitData);
      }
      
      if (res.error) {
        addToast(res.error, "error");
      } else {
        addToast(`Berhasil ${editingData ? "memperbarui" : "menyimpan"} data.`, "success");
        setIsFormVisible(false);
        setEditingData(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const switchTab = (tab: "albums" | "items") => {
    setActiveTab(tab);
    setIsFormVisible(false);
    setEditingData(null);
  };

  // Opsi Dropdown Album (Untuk Item Media)
  const albumOptions = [
    { label: "-- Tanpa Album (Berdiri Sendiri) --", value: "" },
    ...initialAlbums.map(a => ({ label: a.title, value: String(a.id) }))
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Navigator Kustom */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => switchTab("albums")} className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold transition-colors border-b-2 ${activeTab === "albums" ? "bg-white text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          <FolderOpen className="w-4 h-4" /> Album Dokumentasi
        </button>
        <button onClick={() => switchTab("items")} className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold transition-colors border-b-2 ${activeTab === "items" ? "bg-white text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          <ImageIcon className="w-4 h-4" /> Media (Foto & Video)
        </button>
      </div>

      {/* ==================================================== */}
      {/* MODE 1: ALBUMS */}
      {/* ==================================================== */}
      {activeTab === "albums" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
          <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800">Daftar Album</h3>
              <p className="text-xs text-gray-500 mt-0.5">Kelompokkan foto dan video berdasarkan kegiatan.</p>
            </div>
            <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Buat Album
            </button>
          </div>
          <div className="overflow-x-auto pb-12">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] w-16 text-center">ID</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Detail Album</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-center">Jenis Media</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Rentang Kegiatan</th>
                  <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {initialAlbums.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada album yang dibuat.</td></tr>
                ) : (
                  initialAlbums.map((album) => (
                    <tr key={album.id} className="hover:bg-emerald-50/30 transition-colors group h-16">
                      <td className="px-5 py-4 text-center text-gray-400 font-mono text-xs font-bold">#{album.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">{album.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-sm">{album.description || "-"}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded border shadow-sm
                          ${album.media_kind === 'photo' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            album.media_kind === 'video' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                            'bg-purple-50 text-purple-700 border-purple-100'}`}
                        >
                          {album.media_kind === 'photo' ? '📷 Foto' : album.media_kind === 'video' ? '🎥 Video' : '🔄 Campuran'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs font-medium">
                        {album.start_date ? formatDateID(album.start_date) : "?"} <br/> 
                        <span className="text-gray-400">s/d</span> {album.end_date ? formatDateID(album.end_date) : "?"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(album)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => void handleDelete(album.id, album.title, "album")} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in">
          <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800">Daftar Foto & Video</h3>
              <p className="text-xs text-gray-500 mt-0.5">Media satuan yang akan muncul di galeri jamaah.</p>
            </div>
            <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Unggah Media
            </button>
          </div>
          <div className="overflow-x-auto pb-12">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] w-20 text-center">Tipe</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Pratinjau Media / Keterangan</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Album Induk</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-center w-24">Highlight</th>
                  <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {initialItems.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada media terdaftar.</td></tr>
                ) : (
                  initialItems.sort((a,b) => a.sort_order - b.sort_order).map((item) => {
                    const parentAlbum = initialAlbums.find(a => a.id === item.album_id);
                    return (
                      <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-5 py-4 text-center">
                          {item.media_type === 'video' ? (
                            <div className="flex flex-col items-center gap-1 text-rose-500"><Video className="w-6 h-6"/> <span className="text-[9px] font-bold uppercase">Video</span></div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-blue-500"><Camera className="w-6 h-6"/> <span className="text-[9px] font-bold uppercase">Foto</span></div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-4">
                            {item.media_type === 'image' ? (
                              <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                <img src={item.media_url} alt="thumbnail" className="w-full h-full object-cover bg-gray-100" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Video className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 pt-1">
                              <p className="text-sm font-bold text-gray-900 truncate">{item.caption || "Tanpa Keterangan"}</p>
                              {item.media_type === 'video' ? (
                                <div className="mt-1"><ConfirmRedirect url={item.media_url} display="Lihat Tautan Video" /></div>
                              ) : (
                                <p className="text-[10px] text-gray-400 mt-1 font-mono truncate">{item.media_url}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {parentAlbum ? (
                            <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 rounded-md truncate max-w-[150px]">
                              {parentAlbum.title}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Tanpa Album</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {item.is_highlight ? <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto" /> : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(item)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm" title="Edit"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => void handleDelete(item.id, `Media #${item.id}`, "item")} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
      {/* FORM ENTRY BERSAMA */}
      {/* ==================================================== */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">
                {editingData ? "Edit " : "Tambah "} 
                {activeTab === "albums" ? "Album" : "Media (Foto/Video)"}
              </h3>
              <p className="text-emerald-200 text-xs mt-0.5">{editingData ? `Menyunting Data ID: #${editingData.id}` : "Lengkapi informasi di bawah ini."}</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form key={editingData ? editingData.id : "new"} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* INPUT UNTUK ALBUM */}
            {activeTab === "albums" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Album <span className="text-rose-500">*</span></label>
                    <input type="text" name="title" defaultValue={editingData?.title} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm disabled:bg-gray-100" placeholder="Cth: Dokumentasi Idul Adha 1447H" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Mulai Kegiatan (Opsional)</label>
                    <CustomDateInput name="start_date" defaultValue={editingData?.start_date} disabled={isPending} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Selesai (Opsional)</label>
                    <CustomDateInput name="end_date" defaultValue={editingData?.end_date} disabled={isPending} />
                  </div>
                </div>
                
                <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-6 border-t border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis Media di Dalamnya <span className="text-rose-500">*</span></label>
                      <CustomSelect 
                        name="media_kind" 
                        defaultValue={editingData?.media_kind || "photo"} 
                        disabled={isPending}
                        options={[
                          { label: "📷 Hanya Foto", value: "photo" },
                          { label: "🎥 Hanya Video", value: "video" },
                          { label: "🔄 Campuran", value: "mix" }
                        ]}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Album (Opsional)</label>
                      <textarea name="description" defaultValue={editingData?.description} rows={3} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:bg-gray-100" placeholder="Penjelasan singkat mengenai acara dalam album ini..."></textarea>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* INPUT UNTUK MEDIA ITEM */}
            {activeTab === "items" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipe Media <span className="text-rose-500">*</span></label>
                    <CustomSelect 
                      name="media_type" 
                      defaultValue={editingData?.media_type || "image"} 
                      disabled={isPending}
                      options={[{ label: "📷 Gambar / Foto", value: "image" }, { label: "🎥 Tautan Video", value: "video" }]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Album Induk (Opsional)</label>
                    <CustomSelect 
                      name="album_id" 
                      defaultValue={editingData?.album_id ? String(editingData.album_id) : ""} 
                      disabled={isPending}
                      options={albumOptions}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Media (Link Gambar / Video) <span className="text-rose-500">*</span></label>
                    <input type="url" name="media_url" defaultValue={editingData?.media_url} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:bg-gray-100 font-mono" placeholder="https://..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Keterangan Media (Caption)</label>
                    <input type="text" name="caption" defaultValue={editingData?.caption} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm disabled:bg-gray-100" placeholder="Cth: Suasana salat ied di lapangan..." />
                  </div>
                </div>

                <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-6 border-t border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Waktu Pengambilan (Opsional)</label>
                      <input type="datetime-local" name="taken_at" defaultValue={editingData?.taken_at ? new Date(editingData.taken_at).toISOString().slice(0, 16) : ""} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm bg-white disabled:bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Lokasi (Opsional)</label>
                      <input type="text" name="location_note" defaultValue={editingData?.location_note} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm bg-white disabled:bg-gray-100" placeholder="Cth: Halaman Utama Masjid" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jadikan Bintang Utama (Highlight)? <span className="text-rose-500">*</span></label>
                      <CustomSelect 
                        name="is_highlight" 
                        defaultValue={editingData ? String(editingData.is_highlight) : "false"} 
                        disabled={isPending}
                        options={[{ label: "⭐ Ya, Tampilkan Besar", value: "true" }, { label: "Tidak, Standar Saja", value: "false" }]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan Tampil (Sort Order) <span className="text-rose-500">*</span></label>
                      <input type="number" name="sort_order" defaultValue={editingData?.sort_order ?? 0} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm bg-white disabled:bg-gray-100" />
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
                {isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> {editingData ? "Simpan Perubahan" : "Simpan Data"}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
