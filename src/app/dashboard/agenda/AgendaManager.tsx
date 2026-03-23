"use client";

import { useState, useTransition, useRef } from "react";
import { 
  createPrayerDuty, updatePrayerDuty, deletePrayerDuty, updatePrayerSettings,
  createSpecialDay, updateSpecialDay, deleteSpecialDay,
  createPrayerTime, updatePrayerTime, deletePrayerTime
} from "../../actions/worship";
import CustomSelect from "../../../components/ui/CustomSelect";
import CustomDateInput from "../../../components/ui/CustomDateInput";
import CustomTimeInput from "../../../components/ui/CustomTimeInput";
import { useToast } from "../../../components/ui/Toast";
import { formatDateID } from "../../../lib/utils";
import { Clock, CalendarDays, Users, Settings, Plus, Edit3, Trash2, Save, X, MapPin, Map } from "lucide-react";

// ============================================================================
// KOMPONEN SUB-TAB (Tabel)
// ============================================================================

const DutiesTab = ({ duties, onEdit, onDelete, isPending }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="bg-white text-gray-400 border-b border-gray-100 text-[11px] uppercase tracking-wider">
        <tr>
          <th className="px-5 py-3">Tanggal</th><th className="px-5 py-3 text-center">Waktu</th>
          <th className="px-5 py-3">Imam / Khatib</th><th className="px-5 py-3">Muadzin</th><th className="px-5 py-3 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {duties.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada penugasan</td></tr> : duties.map((d: any) => (
          <tr key={d.id} className="hover:bg-emerald-50/30 group">
            <td className="px-5 py-3 font-medium text-gray-900">{formatDateID(d.duty_date)}</td>
            <td className="px-5 py-3 text-center capitalize">
              {/* DIPERBESAR: text-xs, px-3, w-32 */}
              <span className={`inline-block w-32 text-center px-3 py-1.5 rounded-md text-xs font-bold tracking-wide ${d.category === 'fardhu' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {d.category === 'fardhu' ? `Harian (${d.prayer})` : d.category}
              </span>
            </td>
            <td className="px-5 py-3 font-bold text-gray-900">{d.khatib_name || d.imam_name || "-"}</td>
            <td className="px-5 py-3 text-gray-600">{d.muadzin_name || "-"}</td>
            <td className="px-5 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(d, "duties")} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 mr-2 shadow-sm"><Edit3 className="w-4 h-4"/></button>
              <button onClick={() => onDelete(d.id, `Petugas ${formatDateID(d.duty_date)}`, deletePrayerDuty)} disabled={isPending} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 shadow-sm"><Trash2 className="w-4 h-4"/></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SpecialTab = ({ specialDays, onEdit, onDelete, isPending }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="bg-white text-gray-400 border-b border-gray-100 text-[11px] uppercase tracking-wider">
        <tr><th className="px-5 py-3">Tanggal & Jam</th><th className="px-5 py-3 text-center">Jenis Acara</th><th className="px-5 py-3">Kegiatan</th><th className="px-5 py-3 text-right">Aksi</th></tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {specialDays.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-400">Belum ada agenda hari besar</td></tr> : specialDays.map((d: any) => (
          <tr key={d.id} className="hover:bg-emerald-50/30 group">
            <td className="px-5 py-3">
              <p className="font-medium text-gray-900">{formatDateID(d.day_date)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.start_time ? d.start_time.slice(0,5) : "Seharian"}</p>
            </td>
            <td className="px-5 py-3 text-center capitalize">
              {/* DIPERBESAR: text-xs, px-3, w-32 */}
              <span className="inline-block w-32 text-center px-3 py-1.5 rounded-md text-xs font-bold tracking-wide bg-purple-100 text-purple-700">
                {d.kind.replace('_', ' ')}
              </span>
            </td>
            <td className="px-5 py-3 font-bold text-gray-900">{d.title}</td>
            <td className="px-5 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(d, "special")} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 mr-2 shadow-sm"><Edit3 className="w-4 h-4"/></button>
              <button onClick={() => onDelete(d.id, d.title, deleteSpecialDay)} disabled={isPending} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 shadow-sm"><Trash2 className="w-4 h-4"/></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================================================
// KOMPONEN UTAMA (Container)
// ============================================================================

export default function AgendaManager({ 
  initialSettings, initialPrayerTimes, initialDuties, initialSpecialDays, calendarData 
}: { 
  initialSettings: any, initialPrayerTimes: any[], initialDuties: any[], initialSpecialDays: any[], calendarData: any[] 
}) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"duties" | "settings" | "special" | "manual">("duties");
  const [editingData, setEditingData] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [dutyCategory, setDutyCategory] = useState("fardhu");
  
  const formRef = useRef<HTMLDivElement>(null);

  const switchTab = (tab: any) => { setActiveTab(tab); setIsFormVisible(false); setEditingData(null); };

  const handleAddNew = () => {
    setEditingData(null); setDutyCategory("fardhu"); setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleEdit = (data: any, tabType: string) => {
    setEditingData(data);
    if (tabType === "duties") setDutyCategory(data.category);
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = (id: number, label: string, actionFn: any) => {
    if (!window.confirm(`Yakin ingin menghapus data "${label}"?`)) return;
    startTransition(async () => {
      const res = await actionFn(id);
      if (res.error) addToast(res.error, "error");
      else addToast(`Berhasil dihapus.`, "success");
    });
  };

  const submitGeneric = (e: React.FormEvent<HTMLFormElement>, createFn: any, updateFn: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      if ((key.includes('time') || key === 'start_time') && typeof value === 'string' && value.length === 5) {
        payload[key] = value + ":00";
      } else { payload[key] = value; }
    }
    if (activeTab === "duties" && payload.category !== "fardhu") delete payload.prayer;
    if (editingData) payload.id = editingData.id;
    
    const submitData = new FormData(); submitData.append("payload", JSON.stringify(payload));
    startTransition(async () => {
      const res = editingData ? await updateFn(submitData) : await createFn(submitData);
      if (res.error) addToast(res.error, "error");
      else {
        addToast(`Data berhasil ${editingData ? 'diperbarui' : 'disimpan'}.`, "success");
        setIsFormVisible(false); setEditingData(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const submitSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const payload = {
      ...data,
      adj_subuh_min: Number(data.adj_subuh_min), adj_dzuhur_min: Number(data.adj_dzuhur_min),
      adj_ashar_min: Number(data.adj_ashar_min), adj_maghrib_min: Number(data.adj_maghrib_min),
      adj_isya_min: Number(data.adj_isya_min),
    };
    const submitData = new FormData(); submitData.append("payload", JSON.stringify(payload));
    
    startTransition(async () => {
      const res = await updatePrayerSettings(submitData);
      if (res.error) addToast(res.error, "error");
      else { addToast("Pengaturan berhasil disimpan.", "success"); setIsFormVisible(false); }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* KARTU PRATINJAU UTAMA */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl shadow-lg border border-emerald-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Clock className="w-48 h-48 text-white" /></div>
        <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-sm font-bold tracking-widest text-emerald-300 uppercase mb-2">Pratinjau Jadwal Terdekat</h3>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <p className="text-xl font-bold">{initialSettings.location_mode === 'city' ? initialSettings.city_name : 'Titik Koordinat GPS'}</p>
            </div>
            <p className="text-xs text-emerald-100/80">Kalkulasi: {initialSettings.calc_method.toUpperCase()} | Zona: {initialSettings.timezone}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex gap-4 md:gap-6 overflow-x-auto">
            {calendarData.slice(0, 1).map((today: any) => (
              <div key={today.day_date} className="flex gap-4 sm:gap-6 min-w-max">
                <div className="text-center"><p className="text-[10px] text-emerald-200 uppercase font-bold mb-1">Subuh</p><p className="text-lg font-bold text-white">{today.subuh_time.slice(0,5)}</p></div>
                <div className="text-center"><p className="text-[10px] text-emerald-200 uppercase font-bold mb-1">Dzuhur</p><p className="text-lg font-bold text-white">{today.dzuhur_time.slice(0,5)}</p></div>
                <div className="text-center"><p className="text-[10px] text-emerald-200 uppercase font-bold mb-1">Ashar</p><p className="text-lg font-bold text-white">{today.ashar_time.slice(0,5)}</p></div>
                <div className="text-center"><p className="text-[10px] text-emerald-200 uppercase font-bold mb-1">Maghrib</p><p className="text-lg font-bold text-white">{today.maghrib_time.slice(0,5)}</p></div>
                <div className="text-center"><p className="text-[10px] text-emerald-200 uppercase font-bold mb-1">Isya</p><p className="text-lg font-bold text-white">{today.isya_time.slice(0,5)}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TAB NAVIGASI */}
      <div className="flex flex-wrap border-b border-gray-200">
        <button onClick={() => switchTab("duties")} className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold transition-colors border-b-2 ${activeTab === "duties" ? "bg-white text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          <Users className="w-4 h-4" /> Penugasan Takmir
        </button>
        <button onClick={() => switchTab("special")} className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold transition-colors border-b-2 ${activeTab === "special" ? "bg-white text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          <CalendarDays className="w-4 h-4" /> Hari Besar
        </button>
        <button onClick={() => switchTab("settings")} className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold transition-colors border-b-2 ${activeTab === "settings" ? "bg-white text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          <Settings className="w-4 h-4" /> Pengaturan Kalkulasi
        </button>
        <button onClick={() => switchTab("manual")} className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold transition-colors border-b-2 ${activeTab === "manual" ? "bg-white text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
          <Map className="w-4 h-4" /> Override Manual
        </button>
      </div>

      {/* AREA TAB TABEL */}
      {activeTab === "duties" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Penugasan Imam & Muadzin</h3>
            <button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 active:scale-95 transition-all"><Plus className="w-4 h-4" /> Tambah Petugas</button>
          </div>
          <DutiesTab duties={initialDuties} onEdit={handleEdit} onDelete={handleDelete} isPending={isPending} />
        </div>
      )}

      {activeTab === "special" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Agenda Hari Besar</h3>
            <button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 active:scale-95 transition-all"><Plus className="w-4 h-4" /> Tambah Agenda</button>
          </div>
          <SpecialTab specialDays={initialSpecialDays} onEdit={handleEdit} onDelete={handleDelete} isPending={isPending} />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Parameter Kalkulasi Waktu Salat</h3>
            {!isFormVisible && <button onClick={() => setIsFormVisible(true)} className="bg-white border border-gray-200 hover:border-emerald-200 text-emerald-700 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm"><Edit3 className="w-4 h-4" /> Ubah Pengaturan</button>}
          </div>
          {!isFormVisible && (
             <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Zona Waktu</p><p className="font-semibold text-gray-900">{initialSettings.timezone}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mode Lokasi</p><p className="font-semibold text-gray-900">{initialSettings.location_mode === 'city' ? "Nama Kota" : "Koordinat GPS"}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Lokasi Detail</p><p className="font-semibold text-emerald-700">{initialSettings.city_name || "Diatur Otomatis"}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Metode Hitung</p><p className="font-semibold text-gray-900 uppercase">{initialSettings.calc_method}</p></div>
             </div>
          )}
        </div>
      )}

      {activeTab === "manual" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Jadwal Manual (Override)</h3>
            <button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm"><Plus className="w-4 h-4" /> Timpa Jadwal</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b border-gray-100 text-[11px] uppercase tracking-wider">
                <tr><th className="px-5 py-3">Tanggal Override</th><th className="px-5 py-3">S</th><th className="px-5 py-3">D</th><th className="px-5 py-3">A</th><th className="px-5 py-3">M</th><th className="px-5 py-3">I</th><th className="px-5 py-3 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {initialPrayerTimes.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-gray-400">Tidak ada jadwal manual aktif</td></tr> : initialPrayerTimes.map(p => (
                  <tr key={p.id} className="hover:bg-emerald-50/30 group">
                    <td className="px-5 py-3 font-medium text-gray-900">{formatDateID(p.day_date)}</td>
                    <td className="px-5 py-3 text-gray-600 font-medium">{p.subuh_time.slice(0,5)}</td><td className="px-5 py-3 text-gray-600 font-medium">{p.dzuhur_time.slice(0,5)}</td>
                    <td className="px-5 py-3 text-gray-600 font-medium">{p.ashar_time.slice(0,5)}</td><td className="px-5 py-3 text-gray-600 font-medium">{p.maghrib_time.slice(0,5)}</td>
                    <td className="px-5 py-3 text-gray-600 font-medium">{p.isya_time.slice(0,5)}</td>
                    <td className="px-5 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(p, "manual")} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded mr-2"><Edit3 className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(p.id, `Override ${formatDateID(p.day_date)}`, deletePrayerTime)} disabled={isPending} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. AREA FORM ENTRY (BERDASARKAN TAB) */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">
              {activeTab === 'settings' ? 'Ubah Pengaturan Kalkulasi' : editingData ? 'Edit Data' : 'Tambah Data Baru'}
            </h3>
            <button onClick={() => setIsFormVisible(false)} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6 md:p-8">
            
            {/* FORM: DUTIES */}
            {activeTab === "duties" && (
              <form onSubmit={(e) => submitGeneric(e, createPrayerDuty, updatePrayerDuty)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori Waktu <span className="text-rose-500">*</span></label>
                    <div onClick={() => !editingData} className={editingData ? "opacity-70 pointer-events-none" : ""}>
                      {/* Menggunakan CustomSelect dengan onChange handler */}
                      <CustomSelect 
                        name="category" 
                        defaultValue={dutyCategory} 
                        onChange={setDutyCategory}
                        options={[
                          {label: "Harian (Fardhu)", value: "fardhu"},
                          {label: "Jumat", value: "jumat"},
                          {label: "Tarawih", value: "tarawih"},
                          {label: "Hari Raya (Id)", value: "id"}
                        ]} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Tugas <span className="text-rose-500">*</span></label>
                    <CustomDateInput name="duty_date" defaultValue={editingData?.duty_date} required disabled={isPending} />
                  </div>
                  
                  {dutyCategory === "fardhu" && (
                    <div className="md:col-span-2 animate-in fade-in">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pilih Waktu Salat <span className="text-rose-500">*</span></label>
                      <CustomSelect name="prayer" defaultValue={editingData?.prayer || "subuh"} options={[{label:"Subuh", value:"subuh"},{label:"Dzuhur", value:"dzuhur"},{label:"Ashar", value:"ashar"},{label:"Maghrib", value:"maghrib"},{label:"Isya", value:"isya"}]} disabled={isPending} />
                    </div>
                  )}

                  <div className={dutyCategory === "fardhu" ? "" : "md:col-span-2"}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{dutyCategory === "jumat" || dutyCategory === "id" ? "Nama Khatib / Imam" : "Nama Imam"} <span className="text-rose-500">*</span></label>
                    <input type="text" name={dutyCategory === "jumat" || dutyCategory === "id" ? "khatib_name" : "imam_name"} defaultValue={editingData?.khatib_name || editingData?.imam_name} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100" />
                  </div>
                  <div className={dutyCategory === "fardhu" ? "" : "md:col-span-2"}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Muadzin (Opsional)</label>
                    <input type="text" name="muadzin_name" defaultValue={editingData?.muadzin_name} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100" />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100"><button type="submit" disabled={isPending} className="bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-lg active:scale-95 transition-transform">{isPending ? "Menyimpan..." : "Simpan Petugas"}</button></div>
              </form>
            )}

            {/* FORM: SPECIAL DAYS */}
            {activeTab === "special" && (
              <form onSubmit={(e) => submitGeneric(e, createSpecialDay, updateSpecialDay)} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis Acara <span className="text-rose-500">*</span></label>
                      <CustomSelect name="kind" defaultValue={editingData?.kind || "other"} options={[{label: "Lainnya (Umum)", value: "other"}, {label: "Idul Fitri", value: "idul_fitri"}, {label: "Idul Adha", value: "idul_adha"}]} disabled={isPending} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Acara <span className="text-rose-500">*</span></label>
                      <CustomDateInput name="day_date" defaultValue={editingData?.day_date} required disabled={isPending} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Kegiatan <span className="text-rose-500">*</span></label>
                      <input type="text" name="title" defaultValue={editingData?.title} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="Cth: Pengajian Akbar" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Waktu Mulai (Opsional)</label>
                      <CustomTimeInput name="start_time" defaultValue={editingData?.start_time?.slice(0,5)} disabled={isPending} />
                    </div>
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan / Deskripsi</label>
                   <textarea name="note" defaultValue={editingData?.note} rows={3} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"></textarea>
                 </div>
                 <div className="flex justify-end pt-4 border-t border-gray-100"><button type="submit" disabled={isPending} className="bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-lg active:scale-95 transition-transform">{isPending ? "Menyimpan..." : "Simpan Agenda"}</button></div>
              </form>
            )}

            {/* FORM: SETTINGS */}
            {activeTab === "settings" && (
              <form onSubmit={submitSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Zona Waktu <span className="text-rose-500">*</span></label>
                    <CustomSelect name="timezone" defaultValue={initialSettings.timezone} options={[{label: "WIB (Asia/Jakarta)", value: "Asia/Jakarta"}, {label: "WITA (Asia/Makassar)", value: "Asia/Makassar"}, {label: "WIT (Asia/Jayapura)", value: "Asia/Jayapura"}]} disabled={isPending} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Metode Kalkulasi <span className="text-rose-500">*</span></label>
                    <CustomSelect name="calc_method" defaultValue={initialSettings.calc_method} options={[{label: "Kemenag RI", value: "kemenag"}, {label: "MWL (Liga Muslim Dunia)", value: "mwis"}, {label: "ISNA (Amerika Utara)", value: "isna"}]} disabled={isPending} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mode Lokasi</label>
                    <CustomSelect name="location_mode" defaultValue={initialSettings.location_mode} options={[{label: "Nama Kota", value: "city"}, {label: "Koordinat GPS (Lat/Long)", value: "coordinates"}]} disabled={isPending} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Kota Lengkap</label>
                    <input type="text" name="city_name" defaultValue={initialSettings.city_name} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                  </div>
                </div>
                <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-6 border-t border-b border-gray-100">
                  <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Penyesuaian Waktu Manual / Ihtiyati (Menit)</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {["subuh", "dzuhur", "ashar", "maghrib", "isya"].map(w => (
                      <div key={w}>
                        <span className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5">{w}</span>
                        <input type="number" name={`adj_${w}_min`} defaultValue={initialSettings[`adj_${w}_min`]} disabled={isPending} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-center text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2"><button type="submit" disabled={isPending} className="bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-lg active:scale-95 transition-transform">{isPending ? "Menyimpan..." : "Simpan Pengaturan"}</button></div>
              </form>
            )}

            {/* FORM: MANUAL OVERRIDE */}
            {activeTab === "manual" && (
              <form onSubmit={(e) => submitGeneric(e, createPrayerTime, updatePrayerTime)} className="space-y-6">
                 <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Yang Ingin Ditimpa (Override) <span className="text-rose-500">*</span></label>
                   <div className="w-full md:w-1/2">
                     <CustomDateInput name="day_date" defaultValue={editingData?.day_date} required disabled={isPending} />
                   </div>
                 </div>
                 <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-6 border-t border-b border-gray-100">
                   <p className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Masukkan Jam Pasti</p>
                   <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {["subuh_time", "sunrise_time", "dhuha_time", "dzuhur_time", "ashar_time", "maghrib_time", "isya_time"].map(f => (
                        <div key={f}>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1.5">{f.replace('_time','')}</label>
                          <CustomTimeInput name={f} defaultValue={editingData?.[f]?.slice(0,5)} required disabled={isPending} />
                        </div>
                      ))}
                   </div>
                 </div>
                 <div className="flex justify-end pt-2"><button type="submit" disabled={isPending} className="bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-lg active:scale-95 transition-transform">{isPending ? "Menyimpan..." : "Simpan Jadwal Override"}</button></div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}