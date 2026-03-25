import { MapPin, Clock3, Heart, Megaphone, Users, Mail, Phone, ExternalLink } from "lucide-react";

// Helper Format Rupiah
const formatRp = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

export default function FreeZamrud({ data }: { data: any }) {
  const mockAbout = `Assalamualaikum Warahmatullahi Wabarakatuh. Selamat datang di portal digital resmi ${data.name}. Kami hadir sebagai wadah informasi, transparansi pengelolaan masjid, dan jembatan ukhuwah bagi seluruh jamaah.`;
  
  const mockPrayerTimes = [
    { name: "Subuh", time: "04:15" }, { name: "Terbit", time: "05:32" }, { name: "Dzuhur", time: "11:42" },
    { name: "Ashar", time: "14:58" }, { name: "Maghrib", time: "17:55" }, { name: "Isya", time: "19:08" },
  ];

  const mockPrograms = [
    { title: "Kajian Rutin Hadits", time: "Setiap Selasa, Ba'da Maghrib", penceramah: "Ustadz H. Ahmad Fauzi" },
    { title: "TPA Anak-Anak", time: "Senin - Jumat, 16:00 WIB", penceramah: "Ustadzah Siti Aminah" },
  ];

  const mockDonations = [
    { title: "Renovasi Kubah Utama", target: 250000000, collected: 89500000 },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      {/* HERO SECTION */}
      <div className="relative bg-gray-950 text-white pt-24 pb-16 px-4 md:px-8 border-b-8 border-emerald-600">
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1590013330462-6780c6145890?q=80&w=2000')] bg-cover bg-center"></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 bg-white/10 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-white/20 shrink-0">🕌</div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">{data.name}</h1>
            <p className="flex items-center justify-center md:justify-start gap-2.5 mt-3 text-emerald-300 text-sm font-medium">
              <MapPin className="w-4 h-4" /> Jl. Merdeka No. 123, Surakarta, Jawa Tengah
            </p>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 flex-1 w-full">
        {/* ABOUT */}
        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center -mt-16 relative z-20 shadow-xl">
          <div className="flex-1 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Tentang Kami</span>
            <h2 className="text-2xl font-bold text-gray-950">Visi & Misi Masjid</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{mockAbout}</p>
          </div>
          <button className="shrink-0 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <Phone className="w-4 h-4" /> Kontak Kami
          </button>
        </div>

        {/* GRID JADWAL & AGENDA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* KIRI: JADWAL */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700"><Clock3 className="w-5 h-5" /></div>
              <h3 className="font-bold text-lg text-gray-900">Jadwal Salat</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              {mockPrayerTimes.map((item) => (
                <div key={item.name} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg group hover:bg-emerald-50 transition-colors">
                  <p className="text-sm font-bold text-gray-700">{item.name}</p>
                  <p className="text-lg font-black text-gray-900 font-mono">{item.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* KANAN: AGENDA & DONASI */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700"><Megaphone className="w-5 h-5" /></div>
                <h3 className="font-bold text-lg text-gray-900">Agenda & Galang Dana</h3>
              </div>
              <div className="space-y-4">
                {mockPrograms.map((prog, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shrink-0">📚</div>
                    <div>
                      <h4 className="font-bold text-gray-900">{prog.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" /> {prog.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ATRIBUSI (Jika paket FREE) */}
      {data.attribution_enabled && (
        <footer className="py-5 text-center text-[11px] font-medium text-gray-500 bg-gray-50 border-t border-gray-200 w-full">
          Powered by <span className="font-bold text-emerald-600">eTAKMIR.id</span> — Platform Manajemen Masjid Digital Terpadu
        </footer>
      )}
    </div>
  );
}