import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import OnboardingForm from "../../components/OnboardingForm";
import { 
  Globe, Building2, CalendarDays, Megaphone, 
  Banknote, Users, ArrowUpRight, CheckCircle2, 
  LayoutDashboard, Sparkles, ShieldCheck
} from "lucide-react";

async function getTenantProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;
  if (!token) return null;

  try {
    // Jika API_INTERNAL_URL kosong (seperti di lokalmu), ia akan otomatis pakai localhost:8080
    const baseUrl = process.env.API_INTERNAL_URL || "http://localhost:8080";
    
    const res = await fetch(`${baseUrl}/api/v1/tenant/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Gagal fetch data profil tenant:", error);
    return null;
  }
}

// ... sisa kode

export default async function DashboardPage() {
  const profile = await getTenantProfile();

  if (!profile || profile.status !== "success") {
    redirect("/logout");
  }

  const { name, subdomain, status } = profile.data;
  const isNeedsSetup = name === "Toko Baru" || status === "pending";

  // Daftar Shortcut Menu Utama
  const quickLinks = [
    { name: "Profil Masjid", href: "/dashboard/profile", icon: Building2, desc: "Ubah identitas dan alamat" },
    { name: "Jadwal & Agenda", href: "/dashboard/agenda", icon: CalendarDays, desc: "Atur waktu salat & imam" },
    { name: "Manajemen Event", href: "/dashboard/events", icon: Megaphone, desc: "Publikasi kajian & kegiatan" },
    { name: "Kanal Donasi", href: "/dashboard/donations", icon: Banknote, desc: "Kelola rekening & QRIS" },
    { name: "Susunan Pengurus", href: "/dashboard/management", icon: Users, desc: "Daftar takmir & divisi" },
    { name: "Fasilitas & Layanan", href: "/dashboard/features", icon: Sparkles, desc: "Katalog layanan masjid" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      
      {/* --------------------------------------------------------- */}
      {/* TAMPILAN ONBOARDING (JIKA BARU PERTAMA KALI LOGIN) */}
      {/* --------------------------------------------------------- */}
      {isNeedsSetup ? (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="w-full max-w-3xl relative">
            {/* Dekorasi Glow Latar Belakang */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full bg-emerald-400/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>
            
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row relative">
              
              {/* Sisi Kiri: Visual & Value Proposition (Aksen Hijau) */}
              <div className="md:w-5/12 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                {/* Pattern Dekoratif */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-8 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-semibold tracking-wide uppercase text-emerald-50">Langkah Awal</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold leading-tight mb-4 drop-shadow-sm">
                    Mulai Digitalisasi Masjid Anda.
                  </h2>
                  <p className="text-emerald-100/90 text-sm leading-relaxed">
                    Sistem ini dirancang untuk memudahkan takmir dalam mengelola administrasi, keuangan, dan informasi jamaah dalam satu pintu.
                  </p>
                </div>

                <div className="relative z-10 mt-12 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600/50 p-1.5 rounded-md border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-emerald-50">Website publik siap pakai</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600/50 p-1.5 rounded-md border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-emerald-50">Data jamaah terenkripsi aman</span>
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Form Profil (Area Bersih) */}
              <div className="md:w-7/12 p-8 sm:p-10 bg-white flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Profil Organisasi</h3>
                  <p className="text-gray-500 text-sm">
                    Silakan lengkapi nama masjid dan atur alamat tautan (subdomain) untuk portal jamaah Anda.
                  </p>
                </div>

                {/* Kontainer Form */}
                <div className="bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <OnboardingForm />
                  </div>
                </div>
                
                <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                  Informasi ini dapat diubah kembali di pengaturan profil nanti.
                </p>
              </div>

            </div>
          </div>
        </div>
      ) : (
        
        /* --------------------------------------------------------- */
        /* TAMPILAN DASHBOARD UTAMA (JIKA SUDAH SETUP)               */
        /* --------------------------------------------------------- */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Banner Hero Section */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Dekorasi Latar */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <LayoutDashboard className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm tracking-wider uppercase">Ikhtisar Panel</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                {name}
              </h1>
              <p className="text-emerald-100/80 text-sm max-w-xl">
                Pantau seluruh aktivitas, jadwal ibadah, dan kelola konten website jamaah dengan mudah dan tersentralisasi.
              </p>
            </div>

            {/* Status Website Badge */}
            <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl flex items-center gap-4 min-w-[240px]">
              <div className="bg-emerald-500 rounded-full p-2.5 shadow-inner">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-100 font-medium mb-0.5">Status Website</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-white font-bold text-sm tracking-wide">Online Publik</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info & Domain Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1">
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-gray-50/50 rounded-xl">
              <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Akses Portal Jamaah</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Website jamaah siap dikunjungi di tautan berikut:</p>
                </div>
              </div>
              
              <a 
                href={`https://${subdomain}.mosquesaas.com`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm group"
              >
                {subdomain}.mosquesaas.com
                <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Grid Shortcut Menu */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Akses Cepat (Jalan Pintas)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((menu, idx) => (
                <Link
                  key={idx}
                  href={menu.href}
                  className="group bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-5 flex items-start gap-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="bg-gray-50 group-hover:bg-emerald-50 border border-gray-100 group-hover:border-emerald-100 p-3 rounded-xl transition-colors">
                    <menu.icon className="w-6 h-6 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">{menu.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{menu.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}