import { cookies } from "next/headers";
import Navbar from "../components/Navbar";

export default async function Home() {
  // Cek apakah user sudah login di sisi server
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;
  const isLoggedIn = !!token; // true jika token ada

  return (
    <main className="relative min-h-screen font-[family-name:var(--font-geist-sans)] selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Navbar Transparan */}
      <Navbar isLoggedIn={isLoggedIn} />

      {/* 2. Background Image dengan Overlay & Blur filter */}
      <div className="absolute inset-0 z-0">
        {/* Menggunakan gambar masjid yang indah dari Unsplash */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564683214965-3619addd900d?q=80&w=2000&auto=format&fit=crop')" }}
        />
        {/* Lapisan filter putih transparan untuk efek "Putih Suci" */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
        {/* Gradient ke bawah agar teks lebih terbaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
      </div>

      {/* 3. Hero Content (Tengah Layar) */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 max-w-4xl mx-auto pt-20">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-sm font-medium text-gray-700">Platform Digital Masjid Modern</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 drop-shadow-sm">
          Kelola Masjid Anda dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Lebih Berkah.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl font-medium drop-shadow-sm leading-relaxed">
          Satu platform terintegrasi untuk jadwal sholat, pengelolaan donasi, agenda kajian, hingga website publik untuk jamaah. Tanpa ribet, langsung pakai.
        </p>

        {!isLoggedIn && (
          <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-widest">
            Mulai Gratis Sekarang
          </p>
        )}

      </div>
      
    </main>
  );
}