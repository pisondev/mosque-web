"use client";

import { useState, useTransition } from "react";
import {
  createPrayerDuty,
  createPrayerTime,
  createSpecialDay,
  deletePrayerDuty,
  deletePrayerTime,
  deleteSpecialDay,
  updatePrayerDuty,
  updatePrayerSettings,
  updatePrayerTime,
  updateSpecialDay,
} from "../../actions/worship";

// --- Komponen Pembantu: Notifikasi ---
function AlertMessage({ message }: { message: string | null }) {
  if (!message) return null;
  const isSuccess = message.toLowerCase().includes("berhasil");
  return (
    <div
      className={`text-sm px-4 py-3 rounded-lg border mt-4 ${
        isSuccess
          ? "text-green-800 bg-green-50 border-green-200"
          : "text-red-800 bg-red-50 border-red-200"
      }`}
    >
      {message}
    </div>
  );
}

// --- Komponen Pembantu: Delete Box ---
function DeleteBox({
  title,
  onDelete,
}: {
  title: string;
  onDelete: (id: number) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [id, setId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="pt-4 mt-4 border-t border-gray-100 flex items-end gap-2">
      <div className="flex-1">
        <label className="block text-xs font-medium text-red-600 mb-1">{title}</label>
        <input
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Masukkan ID..."
          className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
        />
      </div>
      <button
        disabled={isPending || !id}
        onClick={() => {
          startTransition(async () => {
            setMessage(null);
            const res = await onDelete(Number(id));
            setMessage(res.error || "Berhasil dihapus.");
            if (!res.error) setId("");
          });
        }}
        className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {isPending ? "Menghapus..." : "Hapus"}
      </button>
      {message && <span className="text-xs text-red-600 ml-2 self-center">{message}</span>}
    </div>
  );
}

// --- Komponen 1: Form Pengaturan Waktu Salat ---
function SettingsForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      ...data,
      adj_subuh_min: Number(data.adj_subuh_min),
      adj_dzuhur_min: Number(data.adj_dzuhur_min),
      adj_ashar_min: Number(data.adj_ashar_min),
      adj_maghrib_min: Number(data.adj_maghrib_min),
      adj_isya_min: Number(data.adj_isya_min),
    };

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      setMessage(null);
      const res = await updatePrayerSettings(submitData);
      setMessage(res.error || "Berhasil menyimpan pengaturan.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-semibold text-gray-800 border-b pb-2">Pengaturan Waktu Salat</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Zona Waktu</label>
          <select name="timezone" defaultValue="Asia/Jakarta" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mode Lokasi</label>
          <select name="location_mode" defaultValue="city" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="city">Nama Kota</option>
            <option value="coordinates">Koordinat (Lat/Long)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nama Kota</label>
          <input type="text" name="city_name" defaultValue="Yogyakarta" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Metode Kalkulasi</label>
          <select name="calc_method" defaultValue="kemenag" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="kemenag">Kemenag RI</option>
            <option value="mwis">MWL</option>
            <option value="isna">ISNA</option>
          </select>
        </div>
      </div>
      <div className="pt-2">
        <label className="block text-xs font-medium text-gray-700 mb-2">Penyesuaian Waktu (Menit)</label>
        <div className="grid grid-cols-5 gap-2">
          {["subuh", "dzuhur", "ashar", "maghrib", "isya"].map((waktu) => (
            <div key={waktu}>
              <span className="block text-[10px] text-gray-500 capitalize mb-1">{waktu}</span>
              <input type="number" name={`adj_${waktu}_min`} defaultValue={0} className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm text-gray-900 text-center focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          ))}
        </div>
      </div>
      <AlertMessage message={message} />
      <button type="submit" disabled={isPending} className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
        {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </form>
  );
}

// --- Komponen 2: Form Jadwal Harian ---
function DailyPrayerForm({ isUpdate = false }: { isUpdate?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      setMessage(null);
      const res = isUpdate ? await updatePrayerTime(submitData) : await createPrayerTime(submitData);
      setMessage(res.error || `Berhasil ${isUpdate ? "memperbarui" : "menambah"} jadwal harian.`);
      if (!res.error && !isUpdate) (e.target as HTMLFormElement).reset();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-semibold text-gray-800 border-b pb-2">{isUpdate ? "Update Jadwal Harian" : "Tambah Jadwal Harian"}</h4>
      <div className="flex gap-3">
        {isUpdate && (
          <div className="w-1/4">
            <label className="block text-xs font-medium text-gray-700 mb-1">ID</label>
            <input type="number" name="id" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ID..." />
          </div>
        )}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
          <input type="date" name="day_date" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["subuh_time", "sunrise_time", "dhuha_time", "dzuhur_time", "ashar_time", "maghrib_time", "isya_time"].map((field) => (
          <div key={field}>
            <label className="block text-[10px] font-medium text-gray-700 mb-1 capitalize">{field.replace("_time", "")}</label>
            <input type="time" name={field} required className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        ))}
      </div>
      <AlertMessage message={message} />
      <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-lg w-full transition-colors">
        {isPending ? "Memproses..." : isUpdate ? "Update Jadwal" : "Simpan Jadwal"}
      </button>
    </form>
  );
}

// --- Komponen 3: Form Petugas Ibadah ---
function DutyForm({ isUpdate = false }: { isUpdate?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // State untuk memantau kategori agar dropdown "Waktu Salat" bisa dinamis
  const [selectedCategory, setSelectedCategory] = useState("fardhu");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Sanitasi: Buang string kosong agar menjadi murni 'null' di backend Go
    const payload: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      payload[key] = value;
    }

    // Pastikan field 'prayer' dihapus (menjadi null) jika bukan salat fardhu
    if (payload.category !== "fardhu") {
      delete payload.prayer;
    }

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      setMessage(null);
      const res = isUpdate ? await updatePrayerDuty(submitData) : await createPrayerDuty(submitData);
      setMessage(res.error || `Berhasil ${isUpdate ? "memperbarui" : "menambah"} petugas ibadah.`);
      if (!res.error && !isUpdate) {
        (e.target as HTMLFormElement).reset();
        setSelectedCategory("fardhu");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-semibold text-gray-800 border-b pb-2">{isUpdate ? "Update Petugas Ibadah" : "Jadwal Petugas Ibadah"}</h4>
      <div className="flex gap-3">
        {isUpdate && (
          <div className="w-1/4">
            <label className="block text-xs font-medium text-gray-700 mb-1">ID</label>
            <input type="number" name="id" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ID..." />
          </div>
        )}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
            <select 
              name="category" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="fardhu">Harian (Fardhu)</option>
              <option value="jumat">Jumat</option>
              <option value="tarawih">Tarawih</option>
              <option value="id">Hari Raya (Id)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" name="duty_date" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Dropdown Waktu Salat hanya muncul dan wajib diisi jika kategorinya Fardhu */}
        {selectedCategory === "fardhu" ? (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Waktu Salat</label>
            <select name="prayer" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="subuh">Subuh</option>
              <option value="dzuhur">Dzuhur</option>
              <option value="ashar">Ashar</option>
              <option value="maghrib">Maghrib</option>
              <option value="isya">Isya</option>
            </select>
          </div>
        ) : (
           <div className="hidden"></div> 
        )}
        
        {/* Jika bukan Fardhu, space-nya dibagi rata untuk Imam dan Muadzin */}
        <div className={selectedCategory !== "fardhu" ? "col-span-1" : ""}>
          <label className="block text-xs font-medium text-gray-700 mb-1">{selectedCategory === "jumat" || selectedCategory === "id" ? "Nama Khatib / Imam" : "Nama Imam"}</label>
          <input type="text" name={selectedCategory === "jumat" || selectedCategory === "id" ? "khatib_name" : "imam_name"} placeholder="Ustadz..." required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className={selectedCategory !== "fardhu" ? "col-span-2" : ""}>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nama Muadzin</label>
          <input type="text" name="muadzin_name" placeholder="Bapak..." className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
        <textarea name="note" rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Badal disiapkan..." />
      </div>
      <AlertMessage message={message} />
      <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-lg w-full transition-colors">
        {isPending ? "Memproses..." : isUpdate ? "Update Petugas" : "Tambah Petugas"}
      </button>
    </form>
  );
}

// --- Komponen 4: Form Hari Besar ---
function SpecialDayForm({ isUpdate = false }: { isUpdate?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Sanitasi data
    const payload: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      
      // Jika butuh padding detik untuk time string ("22:42" -> "22:42:00")
      if (key === 'start_time' && typeof value === 'string' && value.length === 5) {
        payload[key] = value + ":00";
      } else {
        payload[key] = value;
      }
    }

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      setMessage(null);
      const res = isUpdate ? await updateSpecialDay(submitData) : await createSpecialDay(submitData);
      setMessage(res.error || `Berhasil ${isUpdate ? "memperbarui" : "menambah"} hari besar.`);
      if (!res.error && !isUpdate) (e.target as HTMLFormElement).reset();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-semibold text-gray-800 border-b pb-2">{isUpdate ? "Update Hari Besar" : "Tambah Hari Besar"}</h4>
      <div className="flex gap-3">
        {isUpdate && (
          <div className="w-1/4">
            <label className="block text-xs font-medium text-gray-700 mb-1">ID</label>
            <input type="number" name="id" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ID..." />
          </div>
        )}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Jenis</label>
            <select name="kind" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="other">Lainnya (Other)</option>
              <option value="idul_fitri">Idul Fitri</option>
              <option value="idul_adha">Idul Adha</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" name="day_date" required className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Judul Kegiatan</label>
          <input type="text" name="title" required placeholder="Cth: Pengajian Akbar..." className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Waktu Mulai</label>
          <input type="time" name="start_time" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Catatan</label>
        <textarea name="note" rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Deskripsi acara..." />
      </div>
      <AlertMessage message={message} />
      <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-lg w-full transition-colors">
        {isPending ? "Memproses..." : isUpdate ? "Update Hari Besar" : "Tambah Hari Besar"}
      </button>
    </form>
  );
}

// --- Komponen Master: Console ---
export default function AgendaConsole() {
  const [activeTab, setActiveTab] = useState<"create" | "update">("create");

  return (
    <div className="space-y-8">
      {/* Block Pengaturan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <SettingsForm />
      </div>

      {/* Toggle Create / Update Mode */}
      <div className="flex justify-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "create" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Mode Tambah Data
        </button>
        <button
          onClick={() => setActiveTab("update")}
          className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "update" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Mode Edit / Hapus (Berdasarkan ID)
        </button>
      </div>

      {/* Block Input Harian, Petugas & Hari Besar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <DailyPrayerForm isUpdate={activeTab === "update"} />
          {activeTab === "update" && <DeleteBox title="Hapus Jadwal Harian (ID)" onDelete={deletePrayerTime} />}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <DutyForm isUpdate={activeTab === "update"} />
          {activeTab === "update" && <DeleteBox title="Hapus Petugas Ibadah (ID)" onDelete={deletePrayerDuty} />}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <SpecialDayForm isUpdate={activeTab === "update"} />
          {activeTab === "update" && <DeleteBox title="Hapus Hari Besar (ID)" onDelete={deleteSpecialDay} />}
        </div>
      </div>
    </div>
  );
}