import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicPortalDisplay, getPublicPortalUrl } from "@/lib/public-portal";
import { getServerApiOrigin } from "@/lib/server-api";
import { 
  Globe, Building2, CalendarDays, Megaphone, 
  Banknote, Users, ArrowUpRight, CheckCircle2, 
  LayoutDashboard, Target
} from "lucide-react";

export const dynamic = "force-dynamic";

const DASHBOARD_FETCH_TIMEOUT_MS = 8000;

async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;
  if (!token) return null;

  try {
    const baseUrl = getServerApiOrigin();

    const [tenantResult, profileResult] = await Promise.allSettled([
      fetchJsonWithTimeout(`${baseUrl}/api/v1/tenant/me`, token),
      fetchJsonWithTimeout(`${baseUrl}/api/v1/tenant/profile`, token),
    ]);

    if (tenantResult.status !== "fulfilled" || !tenantResult.value.ok) {
      if (tenantResult.status === "rejected") {
        console.error("Gagal fetch tenant context:", tenantResult.reason);
      }
      return null;
    }

    const tenantJson = tenantResult.value.body;
    const profileJson =
      profileResult.status === "fulfilled" && profileResult.value.ok ? profileResult.value.body : null;

    const tenantData = tenantJson.data;
    const profileData = profileJson?.data;

    return {
      isNeedsSetup: !tenantData.onboarding_completed,
      subdomain: tenantData.subdomain,
      status: tenantData.status,
      // Prioritaskan Nama Profil (masjid_profiles), jika kosong baru pakai nama asli (tenants)
      displayName: profileData?.official_name || tenantData.name,
      headerImageUrl: profileData?.header_image_url || "",
    };
  } catch (error) {
    console.error("Gagal fetch data dashboard:", error);
    return null;
  }
}

async function fetchJsonWithTimeout(url: string, token: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DASHBOARD_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, body };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

  if (!dashboardData) {
    redirect("/logout");
  }

  const { isNeedsSetup, subdomain, displayName, headerImageUrl } = dashboardData;
  const publicPortalUrl = getPublicPortalUrl(subdomain);
  const publicPortalDisplay = getPublicPortalDisplay(subdomain);

  // 👇 PENERAPAN CAPTIVE ONBOARDING 👇
  // Jika butuh setup, usir dari area ber-sidebar, lempar ke ruangan khusus /setup
  if (isNeedsSetup) {
    redirect("/setup");
  }

  // Daftar Shortcut Menu Utama
  const quickLinks = [
    { name: "Profil Masjid", href: "/dashboard/profile", icon: Building2, desc: "Ubah identitas dan alamat" },
    { name: "Jadwal & Agenda", href: "/dashboard/agenda", icon: CalendarDays, desc: "Atur waktu salat & imam" },
    { name: "Manajemen Event", href: "/dashboard/events", icon: Megaphone, desc: "Publikasi kajian & kegiatan" },
    { name: "Program Donasi", href: "/dashboard/finance/campaigns", icon: Target, desc: "Galang dana jamaah" }, // <-- Tambahan Baru
    { name: "Rekening & QRIS", href: "/dashboard/finance/static-accounts", icon: Banknote, desc: "Kelola rekening manual" },
    { name: "Susunan Pengurus", href: "/dashboard/management", icon: Users, desc: "Daftar takmir & divisi" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Banner Hero Section */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {headerImageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
              style={{ backgroundImage: `url(${headerImageUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/45 via-emerald-900/35 to-emerald-950/55 pointer-events-none" />
          {/* Dekorasi Latar */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm tracking-wider uppercase" style={{ textShadow: "0 2px 6px rgba(0,0,0,0.45)" }}>Ikhtisar Panel</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight" style={{ textShadow: "0 3px 10px rgba(0,0,0,0.55)" }}>
              {displayName}
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-xl" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.45)" }}>
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
              href={publicPortalUrl}
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm group"
            >
              {publicPortalDisplay}
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
    </div>
  );
}
