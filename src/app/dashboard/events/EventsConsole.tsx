"use client";

import { useState, useTransition } from "react";
import { createEvent, updateEvent, deleteEvent } from "../../actions/community";

function AlertMessage({ message }: { message: string | null }) {
  if (!message) return null;
  const isSuccess = message.toLowerCase().includes("berhasil");
  return (
    <div className={`text-sm px-4 py-3 rounded-lg border mt-4 ${isSuccess ? "text-green-800 bg-green-50 border-green-200" : "text-red-800 bg-red-50 border-red-200"}`}>
      {message}
    </div>
  );
}

function EventForm({ isUpdate = false }: { isUpdate?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [timeMode, setTimeMode] = useState("exact_time");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    // Sanitasi Otomatis & Konversi Tipe Data
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue; // Buang string kosong jadi null
      
      if (key === 'capacity') {
        payload[key] = parseInt(value as string, 10);
      } else if (key === 'after_prayer_offset_min') {
        payload[key] = parseInt(value as string, 10);
      } else if ((key === 'start_time' || key === 'end_time') && typeof value === 'string' && value.length === 5) {
        payload[key] = value + ":00"; // Padding detik untuk backend
      } else {
        payload[key] = value;
      }
    }

    // Pastikan tidak mengirim field yang salah mode
    if (payload.time_mode === "exact_time") {
      delete payload.after_prayer;
      delete payload.after_prayer_offset_min;
    } else if (payload.time_mode === "after_prayer") {
      delete payload.start_time;
      delete payload.end_time;
    }

    // Default status untuk create
    if (!isUpdate && !payload.status) payload.status = "upcoming";

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      setMessage(null);
      const res = isUpdate ? await updateEvent(submitData) : await createEvent(submitData);
      setMessage(res.error || `Berhasil ${isUpdate ? "memperbarui" : "menambah"} event.`);
      if (!res.error && !isUpdate) {
        (e.target as HTMLFormElement).reset();
        setTimeMode("exact_time");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h4 className="font-semibold text-gray-800 border-b pb-2">{isUpdate ? "Update Event" : "Tambah Event Baru"}</h4>
      
      {isUpdate && (
        <div className="w-1/3">
          <label className="block text-xs font-medium text-gray-700 mb-1">ID Event *</label>
          <input type="number" name="id" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-blue-500 outline-none" />
        </div>
      )}

      {/* Grid Utama: Informasi Dasar & Waktu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri: Informasi Dasar */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Informasi Dasar</h5>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Judul Event *</label>
            <input type="text" name="title" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none" placeholder="Cth: Kajian Tafsir Jalalain..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori *</label>
              <select name="category" defaultValue="lainnya" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none">
                <option value="kajian_rutin">Kajian Rutin</option>
                <option value="tabligh_akbar">Tabligh Akbar</option>
                <option value="rapat_pengurus">Rapat Pengurus</option>
                <option value="kegiatan_sosial">Kegiatan Sosial</option>
                <option value="phbi">Peringatan Hari Besar</option>
                <option value="pelatihan">Pelatihan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Peserta</label>
              <select name="audience" defaultValue="umum" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none">
                <option value="umum">Umum</option>
                <option value="pria">Pria (Ikhwan)</option>
                <option value="wanita">Wanita (Akhwat)</option>
                <option value="remaja">Remaja</option>
                <option value="anak">Anak-anak</option>
                <option value="pengurus">Internal Pengurus</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pemateri / Pembicara</label>
            <input type="text" name="speaker_name" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none" placeholder="Ustadz..." />
          </div>
        </div>

        {/* Kolom Kanan: Waktu & Mode */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pengaturan Waktu</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
              <input type="date" name="start_date" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Selesai</label>
              <input type="date" name="end_date" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mode Waktu *</label>
            <select name="time_mode" value={timeMode} onChange={(e) => setTimeMode(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none">
              <option value="exact_time">Jam Pasti (Exact Time)</option>
              <option value="after_prayer">Setelah Salat (Ba'da)</option>
            </select>
          </div>
          
          {timeMode === "exact_time" ? (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Jam Mulai</label><input type="time" name="start_time" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Jam Selesai</label><input type="time" name="end_time" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" /></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Setelah Salat</label>
                <select name="after_prayer" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none">
                  <option value="subuh">Subuh</option><option value="dzuhur">Dzuhur</option><option value="ashar">Ashar</option><option value="maghrib">Maghrib</option><option value="isya">Isya</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Jeda Waktu (Menit)</label><input type="number" name="after_prayer_offset_min" placeholder="0" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" /></div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi & Catatan Tambahan (Opsional)</label>
        <textarea name="description" rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none" placeholder="Penjelasan mengenai acara ini..."></textarea>
      </div>

      <AlertMessage message={message} />
      <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-lg w-full transition-colors">
        {isPending ? "Memproses..." : isUpdate ? "Update Event" : "Simpan Event"}
      </button>
    </form>
  );
}

function DeleteBox() {
  const [id, setId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="pt-4 mt-6 border-t border-gray-200 flex items-end gap-2">
      <div className="flex-1">
        <label className="block text-xs font-medium text-red-600 mb-1">Hapus Event (ID)</label>
        <input type="number" value={id} onChange={(e) => setId(e.target.value)} placeholder="Masukkan ID..." className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm outline-none" />
      </div>
      <button disabled={isPending || !id} onClick={() => startTransition(async () => { setMessage(null); const res = await deleteEvent(Number(id)); setMessage(res.error || "Berhasil dihapus."); if (!res.error) setId(""); })} className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold py-2 px-4 rounded-lg">
        {isPending ? "Mengahapus..." : "Hapus"}
      </button>
      {message && <span className="text-xs text-red-600 ml-2">{message}</span>}
    </div>
  );
}

export default function EventsConsole() {
  const [activeTab, setActiveTab] = useState<"create" | "update">("create");

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button onClick={() => setActiveTab("create")} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "create" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>Mode Tambah Event</button>
        <button onClick={() => setActiveTab("update")} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "update" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>Mode Edit / Hapus</button>
      </div>
      <div className="p-6">
        <EventForm isUpdate={activeTab === "update"} />
        {activeTab === "update" && <DeleteBox />}
      </div>
    </div>
  );
}