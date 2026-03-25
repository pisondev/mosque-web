import { cookies } from "next/headers";
import Navbar from "../components/Navbar";
import FloatingWhatsApp from "../components/ui/FloatingWhatsApp";
import MacFrame from "../components/ui/MacFrame";
import ControlPanel from "../components/sections/ControlPanel";
import TemplateCatalog from "../components/sections/TemplateCatalog";
import Pricing from "../components/sections/Pricing";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import HeroCTA from "../components/ui/HeroCTA";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;
  const isLoggedIn = !!token;

  return (
    <main className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)] selection:bg-emerald-100 selection:text-emerald-900 text-gray-900 overflow-x-hidden">
      <Navbar isLoggedIn={isLoggedIn} />

      {/* HERO SECTION */}
      <section id="beranda" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 lg:px-12 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10"></div>
        
        {/* Kiri: Copywriting (45%) */}
        <div className="w-full lg:w-[45%] text-center lg:text-left z-10 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SaaS Takmir Era Baru
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Satu Panel untuk <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Ribuan Kebaikan.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
            Tinggalkan cara lama. Kelola jadwal kajian, transparansi donasi, susunan pengurus, hingga website publik jamaah dalam satu platform modern yang sangat mudah digunakan.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            {!isLoggedIn ? (
              <HeroCTA />
            ) : (
              <Link href="/dashboard" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2">
                Buka Dasbor Admin <LayoutDashboard className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Kanan: Mac Mockup (55%) */}
        <div className="w-full lg:w-[55%] relative z-10 hidden lg:block">
          <MacFrame />
        </div>
      </section>

      {/* SECTIONS */}
      <ControlPanel />
      <TemplateCatalog />
      <Pricing isLoggedIn={isLoggedIn} />
      <FloatingWhatsApp />

      {/* FOOTER */}
      <footer className="py-8 text-center text-gray-500 text-sm bg-gray-950 border-t border-gray-900">
        &copy; 2026 eTAKMIR.id — Platform Manajemen Masjid Digital.
      </footer>
    </main>
  );
}