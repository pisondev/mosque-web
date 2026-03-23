import {
  getPrayerCalendar,
  getPrayerSettings,
  listPrayerDuties,
  listPrayerTimes,
  listSpecialDays,
} from "../../actions/worship";
import AgendaConsole from "./AgendaConsole";

// --- Komponen Pembantu: Info Card ---
function StatCard({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 capitalize">{value || "-"}</p>
      {subValue && <p className="text-[10px] text-gray-400 mt-1">{subValue}</p>}
    </div>
  );
}

// --- Komponen Pembantu: Panel Akordion (Collapsible) ---
function AccordionPanel({ title, description, isOpen = false, children }: { title: string; description: string; isOpen?: boolean; children: React.ReactNode }) {
  return (
    <details className="group bg-white rounded-xl border border-gray-200 shadow-sm [&_summary::-webkit-details-marker]:hidden" open={isOpen}>
      <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors list-none select-none">
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500 font-normal mt-0.5">{description}</p>
        </div>
        <span className="text-gray-400 transition-transform duration-300 group-open:rotate-180">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </summary>
      <div className="border-t border-gray-100 p-5 bg-white">
        {children}
      </div>
    </details>
  );
}

// --- Halaman Utama ---
export default async function AgendaPage() {
  const [settingsRes, prayerTimesRes, dutiesRes, specialDaysRes, calendarRes] = await Promise.all([
    getPrayerSettings(),
    listPrayerTimes(),
    listPrayerDuties(),
    listSpecialDays(),
    getPrayerCalendar(),
  ]);

  const settings = settingsRes?.data || {};
  const prayerTimes = Array.isArray(prayerTimesRes?.data) ? prayerTimesRes.data : [];
  const duties = Array.isArray(dutiesRes?.data) ? dutiesRes.data : [];
  const specialDays = Array.isArray(specialDaysRes?.data) ? specialDaysRes.data : [];
  const calendarData = Array.isArray(calendarRes?.data) ? calendarRes.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-800">Jadwal & Agenda Ibadah</h2>
        <p className="text-gray-500 text-sm mt-1">
          Pusat kendali pengaturan waktu salat, penugasan takmir, dan hari besar masjid.
        </p>
      </div>

      {/* Action Console (Form Input & Edit) dipindah ke atas agar mudah diakses admin */}
      <div className="mb-8">
        <AgendaConsole />
      </div>

      <div className="flex items-center py-2">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink-0 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Arsip & Pratinjau Data Aktif</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Panel 1: Pengaturan Waktu Salat */}
      <AccordionPanel 
        title="Konfigurasi Waktu Salat" 
        description="Pengaturan lokasi dan metode kalkulasi jadwal harian yang sedang aktif."
        isOpen={false}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Mode Lokasi" value={settings.location_mode === 'city' ? settings.city_name : 'Koordinat (GPS)'} />
          <StatCard label="Zona Waktu" value={settings.timezone} />
          <StatCard label="Metode Kalkulasi" value={settings.calc_method === 'kemenag' ? 'Kemenag RI' : settings.calc_method} subValue={`Mazhab Ashar: ${settings.asr_madhhab}`} />
          <StatCard 
            label="Penyesuaian Waktu (Menit)" 
            value="Aktif" 
            subValue={`S:${settings.adj_subuh_min} | D:${settings.adj_dzuhur_min} | A:${settings.adj_ashar_min} | M:${settings.adj_maghrib_min} | I:${settings.adj_isya_min}`} 
          />
        </div>
      </AccordionPanel>

      {/* Panel 2: Kalender & Jadwal Harian */}
      <AccordionPanel 
        title="Jadwal Waktu Salat" 
        description="Pratinjau kalender ibadah dan jadwal manual yang telah disesuaikan."
      >
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Subuh</th>
                <th className="px-4 py-3 font-semibold">Dzuhur</th>
                <th className="px-4 py-3 font-semibold">Ashar</th>
                <th className="px-4 py-3 font-semibold">Maghrib</th>
                <th className="px-4 py-3 font-semibold">Isya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calendarData.slice(0, 10).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-4 text-gray-500 text-center">Belum ada data kalender.</td></tr>
              ) : (
                calendarData.slice(0, 10).map((day: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-900 font-medium">{day.day_date}</td>
                    <td className="px-4 py-2 text-gray-600">{day.subuh_time}</td>
                    <td className="px-4 py-2 text-gray-600">{day.dzuhur_time}</td>
                    <td className="px-4 py-2 text-gray-600">{day.ashar_time}</td>
                    <td className="px-4 py-2 text-gray-600">{day.maghrib_time}</td>
                    <td className="px-4 py-2 text-gray-600">{day.isya_time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-500 text-center border-t border-gray-100">
            * Menampilkan 10 hari terdekat dari kalender. Data jadwal penyesuaian manual (ID: {prayerTimes.map((p:any) => p.id).join(', ') || 'N/A'}) otomatis terintegrasi ke kalender ini.
          </div>
        </div>
      </AccordionPanel>

      {/* Panel 3: Petugas Ibadah */}
      <AccordionPanel 
        title="Penugasan Takmir & Petugas" 
        description="Daftar imam, khatib, dan muadzin untuk salat fardhu, jumat, dan hari raya."
      >
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold w-16">ID</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Kategori (Waktu)</th>
                <th className="px-4 py-3 font-semibold">Imam / Khatib</th>
                <th className="px-4 py-3 font-semibold">Muadzin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {duties.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-4 text-gray-500 text-center">Belum ada data petugas.</td></tr>
              ) : (
                duties.map((duty: any) => (
                  <tr key={duty.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-400">#{duty.id}</td>
                    <td className="px-4 py-2 text-gray-900">{duty.duty_date}</td>
                    <td className="px-4 py-2 text-gray-600 capitalize">
                      {duty.category === 'fardhu' ? `Harian (${duty.prayer})` : duty.category}
                    </td>
                    <td className="px-4 py-2 text-gray-900 font-medium">{duty.khatib_name || duty.imam_name || "-"}</td>
                    <td className="px-4 py-2 text-gray-600">{duty.muadzin_name || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AccordionPanel>

      {/* Panel 4: Hari Besar */}
      <AccordionPanel 
        title="Hari Besar & Kegiatan Spesial" 
        description="Daftar agenda kegiatan khusus seperti Idul Fitri, Ramadhan, atau pengajian akbar."
      >
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold w-16">ID</th>
                <th className="px-4 py-3 font-semibold">Tanggal (Waktu)</th>
                <th className="px-4 py-3 font-semibold">Jenis</th>
                <th className="px-4 py-3 font-semibold">Judul Kegiatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {specialDays.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-4 text-gray-500 text-center">Belum ada data hari besar.</td></tr>
              ) : (
                specialDays.map((day: any) => (
                  <tr key={day.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-400">#{day.id}</td>
                    <td className="px-4 py-2 text-gray-900">
                      {day.day_date} <span className="text-gray-400 text-xs">{day.start_time ? `(${day.start_time.slice(0, 5)})` : ''}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-600 capitalize">{day.kind.replace('_', ' ')}</td>
                    <td className="px-4 py-2 text-gray-900 font-medium">{day.title}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AccordionPanel>

    </div>
  );
}