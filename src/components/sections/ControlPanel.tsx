"use client";
import { useState, useEffect } from "react";
import { LayoutDashboard, CalendarDays, BookOpen, Settings, Target } from "lucide-react";

const DASHBOARD_FEATURES = [
  { icon: LayoutDashboard, title: "Dasbor & Profil", desc: "Pantau ikhtisar aktivitas, kelola profil identitas masjid, dan susun struktur kepengurusan dengan rapi." },
  { icon: Target, title: "Keuangan & Donasi", desc: "Transparansi rekening statis, QRIS, dan kelola program donasi secara digital dengan efisien." },
  { icon: CalendarDays, title: "Kegiatan & Agenda", desc: "Jadwalkan kajian rutin, kelola event akbar, dan publikasikan jadwal ibadah harian jamaah." },
  { icon: BookOpen, title: "Konten Publikasi", desc: "Terbitkan artikel keislaman, berita masjid, dan simpan dokumentasi kegiatan di Galeri Media." },
  { icon: Settings, title: "Pengaturan Sistem", desc: "Atur fasilitas layanan masjid, kelola domain custom (.web.id), dan konfigurasi paket Anda." },
];

export default function ControlPanel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play bergeser setiap 3.5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DASHBOARD_FEATURES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Fungsi mesin penggerak posisi Card (Logic Murni)
  const getCardClass = (index: number) => {
    const length = DASHBOARD_FEATURES.length;
    let diff = index - currentIndex;

    // Membuat array menjadi sirkular (tanpa ujung)
    if (diff > Math.floor(length / 2)) diff -= length;
    if (diff < -Math.floor(length / 2)) diff += length;

    // Posisi Tengah (Aktif & Membesar)
    if (diff === 0) {
      return "translate-x-0 scale-100 opacity-100 z-30 shadow-2xl shadow-emerald-900/10 border-emerald-100";
    }
    // Posisi Kanan (Mengecil & Redup)
    if (diff === 1) {
      return "translate-x-[90%] md:translate-x-[110%] scale-[0.85] opacity-40 z-20 cursor-pointer hover:opacity-60 border-gray-200";
    }
    // Posisi Kiri (Mengecil & Redup)
    if (diff === -1) {
      return "-translate-x-[90%] md:-translate-x-[110%] scale-[0.85] opacity-40 z-20 cursor-pointer hover:opacity-60 border-gray-200";
    }
    // Sembunyikan sisa card di belakang layar
    return diff > 0
      ? "translate-x-[200%] scale-50 opacity-0 z-10 pointer-events-none"
      : "-translate-x-[200%] scale-50 opacity-0 z-10 pointer-events-none";
  };

  return (
    <section id="fitur" className="overflow-hidden bg-gray-50 border-y border-gray-100 py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-black">Ruang Kendali yang Kuat & Transparan</h2>
          <p className="mx-auto max-w-2xl font-medium text-gray-600">
            Satu dasbor intuitif untuk semua fitur. Terintegrasi penuh dari urusan jamaah hingga operasional harian.
          </p>
        </div>

        {/* Area Carousel Kustom */}
        <div className="relative mx-auto flex h-[320px] md:h-[350px] w-full items-center justify-center">
          {DASHBOARD_FEATURES.map((item, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)} // Card samping bisa diklik untuk ke tengah
              className={`absolute flex h-[260px] md:h-[300px] w-[280px] md:w-[400px] flex-col justify-center rounded-2xl border bg-white p-6 md:p-8 transition-all duration-700 ease-in-out ${getCardClass(index)}`}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Indikator Titik (Dots) di Bawah */}
        <div className="mt-8 flex justify-center gap-2">
          {DASHBOARD_FEATURES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-8 bg-emerald-500" : "w-2.5 bg-gray-300 hover:bg-emerald-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}