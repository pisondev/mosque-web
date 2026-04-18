"use client";

import { useMemo, useState, useTransition, useRef } from "react";
import { createEvent, updateEvent, deleteEvent } from "../../actions/community";
import CustomSelect from "../../../components/ui/CustomSelect";
import CustomDateInput from "../../../components/ui/CustomDateInput";
import CustomTimeInput from "../../../components/ui/CustomTimeInput";
import { useToast } from "../../../components/ui/Toast";
import { useDecisionModal } from "../../../components/ui/DecisionModalProvider";
import { formatDateID } from "../../../lib/utils";
import { Plus, Edit3, Trash2, Save, X, ChevronDown, Calendar, Clock, Info, Upload } from "lucide-react";
import { uploadImageFile } from "../../../lib/upload";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

async function fileToPreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

function getComputedEventStatus(evt: any) {
  try {
    const now = new Date();
    const start = new Date(`${evt.start_date}T${evt.start_time || "00:00:00"}`);
    const end = new Date(`${evt.end_date || evt.start_date}T${evt.end_time || evt.start_time || "23:59:59"}`);
    if (now < start) return "upcoming";
    if (now > end) return "finished";
    return "ongoing";
  } catch {
    return evt.status || "upcoming";
  }
}

export default function EventManager({ initialEvents }: { initialEvents: any[] }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const { confirm, choose } = useDecisionModal();
  
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [stepAccess, setStepAccess] = useState<{ 1: true; 2: boolean; 3: boolean }>({ 1: true, 2: false, 3: false });
  const [timeMode, setTimeMode] = useState("exact_time");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const [posterPreview, setPosterPreview] = useState<string>("");
  const [pendingPosterFile, setPendingPosterFile] = useState<File | null>(null);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [posterError, setPosterError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // --- Opsi Dropdown ---
  const categoryOptions = [
    { label: "Kajian Rutin", value: "kajian_rutin" }, { label: "Tabligh Akbar", value: "tabligh_akbar" },
    { label: "Rapat Pengurus", value: "rapat_pengurus" }, { label: "Kegiatan Sosial", value: "kegiatan_sosial" },
    { label: "Peringatan Hari Besar", value: "phbi" }, { label: "Pelatihan", value: "pelatihan" }, { label: "Lainnya", value: "lainnya" }
  ];
  const audienceOptions = [
    { label: "Umum", value: "umum" }, { label: "Pria (Ikhwan)", value: "pria" }, { label: "Wanita (Akhwat)", value: "wanita" },
    { label: "Remaja", value: "remaja" }, { label: "Anak-anak", value: "anak" }, { label: "Internal Pengurus", value: "pengurus" }
  ];
  const afterPrayerOptions = [
    { label: "Subuh", value: "subuh" }, { label: "Dzuhur", value: "dzuhur" }, { label: "Ashar", value: "ashar" },
    { label: "Maghrib", value: "maghrib" }, { label: "Isya", value: "isya" }
  ];
  const NAME_REGEX = /^[A-Za-z -]+$/;

  const computedEvents = useMemo(() => events.map((evt) => ({ ...evt, computed_status: getComputedEventStatus(evt) })), [events]);

  const getFieldValue = (source: FormData | Record<string, any> | null | undefined, key: string) => {
    if (!source) return "";
    if (source instanceof FormData) return String(source.get(key) || "").trim();
    return String(source[key] || "").trim();
  };

  const getStepAccess = (source: FormData | Record<string, any> | null | undefined) => {
    const title = getFieldValue(source, "title");
    const startDate = getFieldValue(source, "start_date");
    const endDate = getFieldValue(source, "end_date");
    const hasStep1 = title.length > 0;
    const hasStep2 = hasStep1 && startDate.length > 0 && endDate.length > 0 && endDate >= startDate;
    return { 1: true, 2: hasStep1, 3: hasStep2 } as const;
  };

  const canOpenStep = (step: 1 | 2 | 3) => {
    if (step === 1) return true;
    return stepAccess[step];
  };

  const syncStepAccess = (source: FormData | Record<string, any> | null | undefined) => {
    setStepAccess(getStepAccess(source));
  };

  // --- Handlers ---
  const handleEditClick = (evt: any) => {
    setEditingEvent(evt);
    setTimeMode(evt.time_mode || "exact_time");
    setIsFormVisible(true);
    setFormStep(1);
    setValidationErrors({});
    setPosterPreview(evt.poster_image_url || "");
    setPendingPosterFile(null);
    setPosterError("");
    syncStepAccess(evt);
  };

  const handleAddNewClick = () => {
    setEditingEvent(null);
    setTimeMode("exact_time");
    setIsFormVisible(true);
    setFormStep(1);
    setValidationErrors({});
    setPosterPreview("");
    setPendingPosterFile(null);
    setPosterError("");
    setStepAccess({ 1: true, 2: false, 3: false });
  };

  const handlePosterChange = async (file?: File) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPosterError("File harus berupa gambar (JPG/PNG/WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setPosterError("Ukuran gambar maksimal 2MB.");
      return;
    }
    try {
      const preview = await fileToPreview(file);
      setPosterPreview(preview);
      setPendingPosterFile(file);
      setPosterError("");
      setIsDirty(true);
    } catch {
      setPosterError("Gagal membaca gambar.");
    }
  };

  const handleCancelEdit = async () => {
    if (isDirty) {
      const action = await choose({
        title: "Perubahan belum disimpan",
        description: "Simpan perubahan, buang perubahan, atau lanjutkan mengedit event.",
        icon: "warning",
        actions: [
          { key: "discard", label: "Buang Perubahan", tone: "danger" },
          { key: "cancel", label: "Batal", tone: "neutral" },
        ],
      });
      if (action !== "discard") return;
    }
    setEditingEvent(null);
    setIsFormVisible(false);
    setFormStep(1);
    setValidationErrors({});
    setIsDirty(false);
    setPosterPreview("");
    setPendingPosterFile(null);
    setPosterError("");
    setStepAccess({ 1: true, 2: false, 3: false });
  };

  const handleDelete = async (id: number, title: string) => {
    const ok = await confirm({
      title: "Hapus event?",
      description: `Event "${title}" akan dihapus dari daftar publikasi.`,
      confirmLabel: "Hapus Event",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res.error) addToast(res.error, "error");
      else {
        setEvents((prev) => prev.filter((evt) => evt.id !== id));
        addToast(`Acara ${title} berhasil dihapus.`, "success");
      }
    });
  };

  const validateStep1 = () => {
    if (!formRef.current) return false;
    const formData = new FormData(formRef.current);
    const title = formData.get("title") as string;
    if (!title || !title.trim()) {
      setValidationErrors({ title: "Judul kegiatan wajib diisi." });
      addToast("Mohon lengkapi judul kegiatan.", "error");
      return false;
    }
    setValidationErrors({});
    syncStepAccess(formData);
    setFormStep(2);
    return true;
  };

  const validateStep2 = () => {
    if (!formRef.current) return false;
    const formData = new FormData(formRef.current);
    const startDate = String(formData.get("start_date") || "");
    const endDate = String(formData.get("end_date") || "");
    if (!startDate.trim() || !endDate.trim()) {
      setValidationErrors({ start_date: "Tanggal mulai dan tanggal selesai wajib dipilih." });
      addToast("Lengkapi tanggal mulai dan tanggal selesai.", "error");
      return false;
    }
    if (endDate < startDate) {
      setValidationErrors({ end_date: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai." });
      addToast("Periksa kembali rentang tanggal acara.", "error");
      return false;
    }
    setValidationErrors({});
    syncStepAccess(formData);
    setFormStep(3);
    return true;
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

    if (payload.speaker_name && (!NAME_REGEX.test(payload.speaker_name) || payload.speaker_name.length > 25)) {
      addToast("Nama pemateri maksimal 25 karakter dan hanya boleh huruf, spasi, atau tanda hubung (-).", "error");
      return;
    }
    if (payload.person_in_charge && (!NAME_REGEX.test(payload.person_in_charge) || payload.person_in_charge.length > 25)) {
      addToast("Penanggung jawab maksimal 25 karakter dan hanya boleh huruf, spasi, atau tanda hubung (-).", "error");
      return;
    }
    if (payload.contact_phone && !/^\d+$/.test(payload.contact_phone)) {
      addToast("Nomor kontak hanya boleh berisi angka.", "error");
      return;
    }
    if (!payload.end_date || payload.end_date < payload.start_date) {
      addToast("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.", "error");
      return;
    }
    if (!payload.end_time) {
      addToast("Jam selesai wajib diisi.", "error");
      return;
    }

    if (payload.time_mode === "exact_time") {
      delete payload.after_prayer;
      delete payload.after_prayer_offset_min;
    } else if (payload.time_mode === "after_prayer") {
      delete payload.start_time;
    }

    if (editingEvent) payload.id = editingEvent.id;

    startTransition(async () => {
      if (pendingPosterFile) {
        setIsUploadingPoster(true);
        try {
          const result = await uploadImageFile(pendingPosterFile, "event_poster", editingEvent?.poster_image_url || undefined);
          payload.poster_image_url = result.url;
        } catch {
          setIsUploadingPoster(false);
          addToast("Gagal mengunggah poster.", "error");
          return;
        }
        setIsUploadingPoster(false);
      }

      const submitData = new FormData();
      submitData.append("payload", JSON.stringify(payload));

      const res = editingEvent ? await updateEvent(submitData) : await createEvent(submitData);
      
      if (res.error) {
        addToast(res.error, "error");
      } else {
        const nextEvent = { ...(editingEvent || {}), ...payload, id: editingEvent?.id || Date.now() };
        setEvents((prev) => editingEvent ? prev.map((evt) => evt.id === editingEvent.id ? { ...evt, ...payload } : evt) : [{ ...nextEvent }, ...prev]);
        addToast(`Berhasil ${editingEvent ? "memperbarui" : "menyimpan"} acara.`, "success");
        setIsFormVisible(false);
        setEditingEvent(null);
        setIsDirty(false);
        setStepAccess({ 1: true, 2: false, 3: false });
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* 1. BAGIAN DAFTAR EVENT (Tabel Utama) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Daftar Event & Acara</h3>
            <p className="text-xs text-gray-500 mt-0.5">Kelola seluruh publikasi kegiatan masjid.</p>
          </div>
          <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Tambah Event
          </button>
        </div>

        {/* pb-32 ditambahkan agar CustomSelect dropdown punya ruang untuk terbuka tanpa terpotong table overflow */}
        <div className="overflow-x-auto pb-32">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Judul Event</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Kategori & Audiens</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Pelaksanaan</th>
                <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px] w-48">Status</th>
                <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialEvents.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada event terdaftar.</td></tr>
              ) : (
                computedEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{evt.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{evt.speaker_name ? `Pemateri: ${evt.speaker_name}` : 'Tanpa Pemateri Khusus'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {/* UKURAN BADGE DIPERBESAR (text-xs, py-1.5, px-2.5) */}
                        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1.5 rounded-md capitalize border border-purple-100 shadow-sm">
                          {evt.category.replace('_', ' ')}
                        </span>
                        {evt.audience && <span className="inline-block bg-gray-50 text-gray-600 text-xs font-semibold px-2.5 py-1.5 rounded-md capitalize border border-gray-200 shadow-sm">{evt.audience}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900 font-bold">{formatDateID(evt.start_date)}</p>
                      <p className="text-xs text-emerald-700 font-bold mt-1 bg-emerald-50 inline-block px-2 py-1 rounded border border-emerald-100">
                        {evt.time_mode === 'exact_time' ? (evt.start_time ? `Pukul ${evt.start_time.slice(0,5)}` : '-') : `Ba'da ${evt.after_prayer}`}
                      </p>
                    </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[152px] px-3 py-2 rounded-lg text-xs font-bold border ${evt.computed_status === "upcoming" ? "bg-blue-50 text-blue-700 border-blue-100" : evt.computed_status === "ongoing" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                          {evt.computed_status === "upcoming" ? "Akan Datang" : evt.computed_status === "ongoing" ? "Sedang Berlangsung" : "Selesai"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(evt)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => void handleDelete(evt.id, evt.title)} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. BAGIAN FORM STEPPER */}
      {isFormVisible && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <button type="button" aria-label="Tutup formulir event" onClick={() => void handleCancelEdit()} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <div className="relative bg-white rounded-[28px] border border-emerald-200 shadow-xl w-full max-w-5xl max-h-[92vh] overflow-visible animate-in zoom-in-95 duration-200">
          
          {/* Header Form */}
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center rounded-t-[28px]">
            <div>
              <h3 className="font-bold text-white text-lg">{editingEvent ? "Edit Data Event" : "Tambah Event Baru"}</h3>
              <p className="text-emerald-200 text-xs mt-0.5">{editingEvent ? `ID: #${editingEvent.id} | Mengubah data event yang sudah ada.` : "Lengkapi formulir secara bertahap."}</p>
            </div>
            <button onClick={() => void handleCancelEdit()} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Navigator Kustom */}
          <div className="mx-6 mt-5 flex overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 relative">
            {[
              { step: 1, label: "Informasi Dasar", icon: Info },
              { step: 2, label: "Pengaturan Waktu", icon: Calendar },
              { step: 3, label: "Review & Publikasi", icon: Save }
            ].map((s) => {
              const isActive = formStep === s.step;
              const isPassed = formStep > s.step;
              const isReachable = canOpenStep(s.step as 1 | 2 | 3);
              return (
                <button 
                  key={s.step}
                  type="button"
                  onClick={() => {
                    if (s.step < formStep || isReachable) {
                      setFormStep(s.step as 1 | 2 | 3);
                    }
                  }} 
                  className={`flex-1 py-3 px-2 text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-2 transition-colors border-b-2 relative ${
                    isActive ? "bg-white text-emerald-700 border-emerald-600 shadow-sm z-10" : 
                    isPassed || isReachable ? "text-emerald-600 border-transparent hover:bg-emerald-50 cursor-pointer" : 
                    "text-gray-400 border-transparent cursor-not-allowed"
                  }`}
                  aria-disabled={!isReachable && s.step > formStep}
                >
                  <s.icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : isPassed || isReachable ? "text-emerald-500" : "text-gray-400"}`} />
                  <span className="hidden sm:inline">{s.step}. {s.label}</span>
                  <span className="sm:hidden text-[10px]">Langkah {s.step}</span>
                </button>
              );
            })}
          </div>

          {/* Form Body - Menggunakan noValidate agar popup HTML mati */}
          <form ref={formRef} id="eventForm" key={editingEvent ? editingEvent.id : "new-event"} onSubmit={handleSubmit} noValidate onChange={(event) => { setIsDirty(true); syncStepAccess(new FormData(event.currentTarget)); }} className="p-6 md:p-8 overflow-y-auto max-h-[calc(92vh-152px)]">
            
            {/* STEP 1: INFORMASI DASAR */}
            <div className={formStep === 1 ? "block space-y-6 animate-in fade-in slide-in-from-right-4" : "hidden"}>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-white">
                  <h3 className="font-bold tracking-widest text-gray-800 uppercase text-sm">Upload Poster Event (Opsional)</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-5 items-start bg-gray-50/80 p-5">
                  <div className="w-full sm:w-48 aspect-[4/3] rounded-lg border border-gray-200 bg-white overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center relative">
                    {posterPreview || editingEvent?.poster_image_url ? (
                      <img src={posterPreview || editingEvent?.poster_image_url} alt="Pratinjau Poster" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-300 flex flex-col items-center">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-semibold text-center px-2">Tidak Ada Poster</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handlePosterChange(event.target.files?.[0])} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isPending || isUploadingPoster} className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg w-full sm:w-auto transition-colors">
                      <Upload className="w-4 h-4" /> Pilih & Ganti Poster
                    </button>
                    {posterError ? <p className="text-[11px] text-rose-600 font-medium">{posterError}</p> : <p className="text-[11px] text-gray-500 leading-relaxed">Maksimal ukuran 2MB. Disarankan berorientasi <strong>Landscape (Lebar)</strong> seperti rasio 4:3 atau 16:9 agar tidak terpotong saat ditampilkan.</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Kegiatan / Event <span className="text-rose-500">*</span></label>
                <input type="text" name="title" defaultValue={editingEvent?.title} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 outline-none transition-colors ${validationErrors.title ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-sm"}`} placeholder="Cth: Kajian Tafsir Jalalain..." />
                {validationErrors.title && <p className="text-rose-500 text-[10px] mt-1.5 font-bold animate-in fade-in">{validationErrors.title}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori Acara <span className="text-rose-500">*</span></label>
                  <CustomSelect name="category" defaultValue={editingEvent?.category || "lainnya"} options={categoryOptions} disabled={isPending} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Jamaah (Audiens)</label>
                  <CustomSelect name="audience" defaultValue={editingEvent?.audience || "umum"} options={audienceOptions} disabled={isPending} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Pemateri / Pembicara</label>
                  <input type="text" name="speaker_name" defaultValue={editingEvent?.speaker_name} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm text-gray-900 outline-none shadow-sm disabled:bg-gray-100" placeholder="Cth: Ustadz Fulan..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Penanggung Jawab (Panitia/PIC)</label>
                  <input type="text" name="person_in_charge" defaultValue={editingEvent?.person_in_charge} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm text-gray-900 outline-none shadow-sm disabled:bg-gray-100" placeholder="Nama Takmir..." />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={validateStep1} disabled={isPending} className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2">
                  Selanjutnya <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>

            {/* STEP 2: PENGATURAN WAKTU */}
            <div className={formStep === 2 ? "block space-y-6 animate-in fade-in slide-in-from-right-4" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Mulai <span className="text-rose-500">*</span></label>
                  {validationErrors.start_date && <p className="text-rose-500 text-[10px] mb-1.5 font-bold animate-in fade-in">{validationErrors.start_date}</p>}
                  <CustomDateInput name="start_date" defaultValue={editingEvent?.start_date} disabled={isPending} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Selesai <span className="text-rose-500">*</span></label>
                  {validationErrors.end_date && <p className="text-rose-500 text-[10px] mb-1.5 font-bold animate-in fade-in">{validationErrors.end_date}</p>}
                  <CustomDateInput name="end_date" defaultValue={editingEvent?.end_date || editingEvent?.start_date} disabled={isPending} required />
                </div>
              </div>
              
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-emerald-800 uppercase mb-2">Mode Waktu Pelaksanaan</label>
                  <div className="w-full md:w-1/2">
                    <CustomSelect name="time_mode" defaultValue={timeMode} onChange={(val) => setTimeMode(val)} options={[{label: "Jam Pasti (Exact Time)", value: "exact_time"}, {label: "Ba'da Salat Fardhu", value: "after_prayer"}]} disabled={isPending} />
                  </div>
                </div>
                
                {timeMode === "exact_time" ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-in fade-in">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3"/> Jam Mulai</label>
                      <CustomTimeInput name="start_time" defaultValue={editingEvent?.start_time?.slice(0,5)} disabled={isPending} />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3"/> Jam Selesai</label>
                      <CustomTimeInput name="end_time" defaultValue={editingEvent?.end_time?.slice(0,5)} disabled={isPending} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1">Setelah Salat Apa?</label>
                      <CustomSelect name="after_prayer" defaultValue={editingEvent?.after_prayer || "maghrib"} options={afterPrayerOptions} disabled={isPending} />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1">Jeda Waktu (Menit)</label>
                      <input type="number" name="after_prayer_offset_min" defaultValue={editingEvent?.after_prayer_offset_min} disabled={isPending} placeholder="0 untuk langsung" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-100" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3"/> Jam Selesai Acara</label>
                      <CustomTimeInput name="end_time" defaultValue={editingEvent?.end_time?.slice(0,5)} disabled={isPending} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setFormStep(1)} disabled={isPending} className="text-gray-500 hover:text-gray-800 text-sm font-bold py-2.5 px-4 transition-colors flex items-center gap-2"><ChevronDown className="w-4 h-4 rotate-90" /> Kembali</button>
                <button type="button" onClick={validateStep2} disabled={isPending} className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2">Selanjutnya <ChevronDown className="w-4 h-4 -rotate-90" /></button>
              </div>
            </div>

            {/* STEP 3: DESKRIPSI & SUBMIT */}
            <div className={formStep === 3 ? "block space-y-6 animate-in fade-in slide-in-from-right-4" : "hidden"}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Publik / Informasi Acara</label>
                <textarea name="description" defaultValue={editingEvent?.description} rows={4} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm text-gray-900 outline-none shadow-sm disabled:bg-gray-100" placeholder="Jelaskan detail acara agar jamaah tertarik hadir..."></textarea>
              </div>
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <label className="block text-xs font-bold tracking-widest text-amber-800 uppercase mb-1.5">Catatan Internal (Khusus Takmir)</label>
                <textarea name="note_internal" defaultValue={editingEvent?.note_internal} rows={2} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-amber-200 outline-none shadow-sm disabled:bg-gray-100" placeholder="Cth: Konsumsi dipesan ke Bu Tini, kunci ruang dipegang Pak RT..."></textarea>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                <button type="button" onClick={() => setFormStep(2)} disabled={isPending} className="text-gray-500 hover:text-gray-800 text-sm font-bold py-2.5 px-4 transition-colors flex items-center gap-2"><ChevronDown className="w-4 h-4 rotate-90" /> Pengaturan Waktu</button>
                <button type="submit" disabled={isPending || isUploadingPoster} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">
                  {isUploadingPoster ? "Mengunggah Poster..." : isPending ? "Memproses Data..." : <><Save className="w-5 h-5" /> {editingEvent ? "Simpan Perubahan Event" : "Publikasikan Event Baru"}</>}
                </button>
              </div>
            </div>

          </form>
        </div>
        </div>
      )}
    </div>
  );
}
