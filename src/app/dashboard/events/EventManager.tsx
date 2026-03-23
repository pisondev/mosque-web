"use client";

import { useState, useTransition, useRef } from "react";
import { createEvent, updateEvent, deleteEvent } from "../../actions/community";

export default function EventManager({ initialEvents }: { initialEvents: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // State untuk Mode Form
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [timeMode, setTimeMode] = useState("exact_time");

  const formRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const handleEditClick = (evt: any) => {
    setEditingEvent(evt);
    setTimeMode(evt.time_mode || "exact_time");
    setIsFormVisible(true);
    setFormStep(1);
    setMessage(null);
    // Scroll mulus ke area form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setIsFormVisible(false);
    setFormStep(1);
    setMessage(null);
  };

  const handleAddNewClick = () => {
    setEditingEvent(null);
    setTimeMode("exact_time");
    setIsFormVisible(true);
    setFormStep(1);
    setMessage(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus event "${title}"?`)) return;
    startTransition(async () => {
      setMessage(null);
      const res = await deleteEvent(id);
      if (res.error) setMessage({ text: res.error, type: "error" });
      else setMessage({ text: "Berhasil menghapus event.", type: "success" });
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      if (key === 'capacity' || key === 'after_prayer_offset_min') {
        payload[key] = parseInt(value as string, 10);
      } else if ((key === 'start_time' || key === 'end_time') && typeof value === 'string' && value.length === 5) {
        payload[key] = value + ":00";
      } else {
        payload[key] = value;
      }
    }

    if (payload.time_mode === "exact_time") {
      delete payload.after_prayer;
      delete payload.after_prayer_offset_min;
    } else if (payload.time_mode === "after_prayer") {
      delete payload.start_time;
      delete payload.end_time;
    }

    if (!editingEvent && !payload.status) payload.status = "upcoming";
    if (editingEvent) payload.id = editingEvent.id;

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      setMessage(null);
      const res = editingEvent ? await updateEvent(submitData) : await createEvent(submitData);
      
      if (res.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setMessage({ text: `Berhasil ${editingEvent ? "memperbarui" : "menambah"} event.`, type: "success" });
        setIsFormVisible(false);
        setEditingEvent(null);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Kembali ke atas setelah sukses
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* 1. BAGIAN DAFTAR EVENT (Tabel Utama) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Daftar Event Terdaftar</h3>
          <button 
            onClick={handleAddNewClick}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Tambah Event Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-white text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 font-medium">Judul Event</th>
                <th className="px-5 py-3 font-medium">Kategori & Audiens</th>
                <th className="px-5 py-3 font-medium">Pelaksanaan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialEvents.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-gray-500 text-center bg-gray-50/50">Belum ada event terdaftar. Klik tombol tambah di kanan atas.</td></tr>
              ) : (
                initialEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{evt.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{evt.speaker_name ? `Pemateri: ${evt.speaker_name}` : 'Tanpa Pemateri'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded capitalize mr-1 border border-gray-200">
                        {evt.category.replace('_', ' ')}
                      </span>
                      {evt.audience && <span className="inline-block bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded capitalize border border-gray-200">{evt.audience}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900 font-medium">{evt.start_date}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {evt.time_mode === 'exact_time' ? (evt.start_time ? evt.start_time.slice(0,5) : '-') : `Ba'da ${evt.after_prayer || '-'}`}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize
                        ${evt.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 
                          evt.status === 'ongoing' ? 'bg-green-100 text-green-800' : 
                          evt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(evt)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium border border-blue-200 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(evt.id, evt.title)} disabled={isPending} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium border border-red-200 transition-colors disabled:opacity-50">Hapus</button>
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

      {/* 2. BAGIAN FORM STEPPER (Muncul jika isFormVisible true) */}
      {isFormVisible && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden scroll-mt-6" ref={formRef}>
          {/* Header Form */}
          <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">{editingEvent ? "Edit Data Event" : "Tambah Event Baru"}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{editingEvent ? `ID: #${editingEvent.id} | Mengubah data event yang sudah ada.` : "Lengkapi formulir secara bertahap."}</p>
            </div>
            <button onClick={handleCancelEdit} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Stepper Navigator */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[1, 2, 3].map((step) => (
              <button 
                key={step}
                type="button"
                onClick={() => setFormStep(step as 1|2|3)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${formStep === step ? "bg-white text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600"}`}
              >
                {step === 1 ? "1. Informasi Dasar" : step === 2 ? "2. Pengaturan Waktu" : "3. Detail & Simpan"}
              </button>
            ))}
          </div>

          {/* Body Form (Key diubah jika editingEvent berubah, untuk mereset defaultValue) */}
          <form key={editingEvent ? editingEvent.id : "new-event"} onSubmit={handleSubmit} className="p-6 md:p-8">
            
            {/* STEP 1: INFORMASI DASAR */}
            <div className={formStep === 1 ? "block space-y-5 animate-in fade-in slide-in-from-bottom-2" : "hidden"}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Event <span className="text-red-500">*</span></label>
                <input type="text" name="title" defaultValue={editingEvent?.title} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Tabligh Akbar Menyambut Ramadhan" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                  <select name="category" defaultValue={editingEvent?.category || "lainnya"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="kajian_rutin">Kajian Rutin</option><option value="tabligh_akbar">Tabligh Akbar</option><option value="rapat_pengurus">Rapat Pengurus</option>
                    <option value="kegiatan_sosial">Kegiatan Sosial</option><option value="phbi">Peringatan Hari Besar (PHBI)</option><option value="pelatihan">Pelatihan</option><option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Peserta</label>
                  <select name="audience" defaultValue={editingEvent?.audience || "umum"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="umum">Umum</option><option value="pria">Pria (Ikhwan)</option><option value="wanita">Wanita (Akhwat)</option>
                    <option value="remaja">Remaja</option><option value="anak">Anak-anak</option><option value="pengurus">Internal Pengurus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Pemateri</label>
                  <input type="text" name="speaker_name" defaultValue={editingEvent?.speaker_name} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Ustadz Fulan..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Penanggung Jawab (PIC)</label>
                  <input type="text" name="person_in_charge" defaultValue={editingEvent?.person_in_charge} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Takmir/Panitia" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setFormStep(2)} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors">Selanjutnya: Atur Waktu &rarr;</button>
              </div>
            </div>

            {/* STEP 2: PENGATURAN WAKTU */}
            <div className={formStep === 2 ? "block space-y-5 animate-in fade-in slide-in-from-bottom-2" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Mulai <span className="text-red-500">*</span></label>
                  <input type="date" name="start_date" defaultValue={editingEvent?.start_date} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Selesai (Jika Berbeda)</label>
                  <input type="date" name="end_date" defaultValue={editingEvent?.end_date} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-900 mb-1.5">Mode Penetapan Jam <span className="text-red-500">*</span></label>
                  <select name="time_mode" value={timeMode} onChange={(e) => setTimeMode(e.target.value)} className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border border-blue-200 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="exact_time">Jam Pasti (Exact Time)</option>
                    <option value="after_prayer">Terikat Waktu Salat (Ba'da)</option>
                  </select>
                </div>
                
                {timeMode === "exact_time" ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-semibold text-blue-800 uppercase tracking-wide mb-1">Jam Mulai</label>
                      <input type="time" name="start_time" defaultValue={editingEvent?.start_time?.slice(0,5)} className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm text-gray-900 outline-none" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-semibold text-blue-800 uppercase tracking-wide mb-1">Jam Selesai</label>
                      <input type="time" name="end_time" defaultValue={editingEvent?.end_time?.slice(0,5)} className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm text-gray-900 outline-none" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-semibold text-blue-800 uppercase tracking-wide mb-1">Setelah Salat Apa?</label>
                      <select name="after_prayer" defaultValue={editingEvent?.after_prayer || "maghrib"} className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm text-gray-900 outline-none bg-white">
                        <option value="subuh">Subuh</option><option value="dzuhur">Dzuhur</option><option value="ashar">Ashar</option><option value="maghrib">Maghrib</option><option value="isya">Isya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-blue-800 uppercase tracking-wide mb-1">Jeda Waktu (Menit)</label>
                      <input type="number" name="after_prayer_offset_min" defaultValue={editingEvent?.after_prayer_offset_min} placeholder="Cth: 0 untuk langsung" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-gray-900 outline-none" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setFormStep(1)} className="text-gray-500 hover:text-gray-800 text-sm font-semibold py-2.5 px-4 transition-colors">&larr; Kembali</button>
                <button type="button" onClick={() => setFormStep(3)} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors">Selanjutnya: Review &rarr;</button>
              </div>
            </div>

            {/* STEP 3: DESKRIPSI & SUBMIT */}
            <div className={formStep === 3 ? "block space-y-5 animate-in fade-in slide-in-from-bottom-2" : "hidden"}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Publik / Informasi Acara</label>
                <textarea name="description" defaultValue={editingEvent?.description} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Jelaskan detail acara agar jamaah tertarik hadir..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Internal (Hanya dilihat Takmir)</label>
                <textarea name="note_internal" defaultValue={editingEvent?.note_internal} rows={2} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-yellow-50/50 text-sm text-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Cth: Konsumsi dipesan ke Bu Tini, kunci ruang dipegang Pak RT..."></textarea>
              </div>

              {message && (
                <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <button type="button" onClick={() => setFormStep(2)} className="text-gray-500 hover:text-gray-800 text-sm font-semibold py-2.5 px-4 transition-colors">&larr; Pengaturan Waktu</button>
                <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">
                  {isPending ? (
                    <>Memproses Data...</>
                  ) : (
                    <>
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      {editingEvent ? "Simpan Perubahan Event" : "Publikasikan Event Baru"}
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}