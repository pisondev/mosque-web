import Link from "next/link";
import { Sparkles, CheckCircle2, Globe, AlertTriangle, LogOut } from "lucide-react";
import OnboardingForm from "../OnboardingForm";

interface PlanItem {
  plan_code: string;
  name: string;
  price: number;
  currency: string;
  features_unlocked: string[];
  attribution_enabled: boolean;
}

export default function OnboardingView({
  plans,
  initialPaymentStatus,
  accountEmail,
  accountName,
}: {
  plans: PlanItem[];
  initialPaymentStatus: string;
  accountEmail: string;
  accountName: string;
}) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-6 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between gap-3 px-1">
        <div className="text-xs text-gray-600 bg-white/90 border border-gray-200 rounded-lg px-3 py-2">
          <p className="font-semibold text-gray-800">Setup akun</p>
          <p className="truncate max-w-[280px] sm:max-w-[420px]">{accountName ? `${accountName} - ` : ""}{accountEmail}</p>
        </div>
        <Link
          href="/logout"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </Link>
      </div>
      
      {/* 1. DESKTOP DIBUAT LEBIH LEBAR (max-w-5xl) */}
      <div className="w-full max-w-5xl relative mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-emerald-400/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row relative">
          
          {/* Sisi Kiri: Visual & Value Proposition */}
          {/* Padding diperkecil di mobile (p-6), normal di tablet (md:p-10), lega di desktop (lg:p-12) */}
          <div className="md:w-5/12 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 p-6 md:p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 md:gap-2 mb-6 md:mb-8 bg-white/10 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                <span className="text-[10px] md:text-xs font-semibold tracking-wide uppercase text-emerald-50">Langkah Awal</span>
              </div>
              
              {/* 2. TEKS DIPERKECIL DI MOBILE (text-2xl vs md:text-3xl lg:text-4xl) */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3 md:mb-4 drop-shadow-sm">
                Mulai Digitalisasi Masjid Anda.
              </h2>
              <p className="text-emerald-100/90 text-xs md:text-sm leading-relaxed">
                Sistem ini dirancang untuk memudahkan takmir dalam mengelola jadwal ibadah, publikasi kegiatan, kanal donasi, dan portal masjid dalam satu pintu.
              </p>
            </div>

            <div className="relative z-10 mt-8 md:mt-12 space-y-3 md:space-y-4">
              <div className="flex items-center gap-2.5 md:gap-3">
                <div className="bg-emerald-600/50 p-1 md:p-1.5 rounded-md border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400" />
                </div>
                <span className="text-xs md:text-sm font-medium text-emerald-50">Website portal masjid siap pakai</span>
              </div>
              <div className="flex items-center gap-2.5 md:gap-3">
                <div className="bg-emerald-600/50 p-1 md:p-1.5 rounded-md border border-emerald-500/30">
                  <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400" />
                </div>
                <span className="text-xs md:text-sm font-medium text-emerald-50">Domain publik: nama-masjid.etakmir.id</span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Form Setup */}
          <div className="md:w-7/12 p-6 md:p-10 lg:p-12 bg-white flex flex-col justify-center">
            <div className="mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2">Identitas Sistem</h3>
              <p className="text-gray-500 text-xs md:text-sm">
                Tentukan nama sistem dan atur alamat tautan (subdomain) untuk portal masjid Anda.
              </p>
            </div>

            <div className="bg-gray-50/50 p-1 rounded-xl md:rounded-2xl border border-gray-100">
              <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-100 shadow-sm">
                <OnboardingForm plans={plans} initialPaymentStatus={initialPaymentStatus} />
              </div>
            </div>
            
            <div className="mt-5 md:mt-6 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg md:rounded-xl">
              <h4 className="text-[11px] md:text-sm font-bold text-amber-800 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2">
                <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Penting Sebelum Melanjutkan
              </h4>
              <ul className="text-[10px] md:text-xs text-amber-700 space-y-1.5 md:space-y-2 list-disc pl-3 md:pl-4">
                <li><strong className="font-bold">Subdomain</strong> bersifat permanen dan tidak dapat diubah sendiri nantinya karena tertanam di infrastruktur server.</li>
                <li><strong className="font-bold">Nama Resmi</strong> berbeda dengan nama yang akan tampil di website jamaah. Anda dapat menyesuaikan tampilan publik tersebut kapan saja di menu Profil.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
