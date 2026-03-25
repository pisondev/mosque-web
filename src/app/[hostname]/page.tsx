import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";

// Import semua template dari folder templates
import FreeZamrud from "../../components/templates/FreeZamrud";
import PremiumElegan from "../../components/templates/PremiumElegan";

// Engine Pendaftar Template (Registry)
// Cara ini sangat scalable. Jika ada 100 template baru, cukup tambahkan di objek ini.
const TEMPLATE_REGISTRY: Record<string, React.FC<{ data: any }>> = {
  "template_default": FreeZamrud,
  "template_premium_1": PremiumElegan,
  // "template_premium_2": PremiumKlasik, (contoh ke depannya)
};

export default async function PublicMasjidPage({ params }: { params: Promise<{ hostname: string }> }) {
  const resolvedParams = await params;
  const hostname = resolvedParams.hostname;

  // MOCK DATA: Simulasi hasil fetch dari API Backend
  const mockPublicData = {
    name: `Masjid ${hostname.toUpperCase()}`,
    subdomain: hostname,
    active_template: "template_default", // <-- Ganti menjadi "template_premium_1" untuk testing
    attribution_enabled: true,
  };

  if (!mockPublicData) {
    return notFound(); 
  }

  // Pilih template dari Registry berdasarkan data backend, fallback ke template_default jika tidak ketemu
  const SelectedTemplate = TEMPLATE_REGISTRY[mockPublicData.active_template] || TEMPLATE_REGISTRY["template_default"];

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] antialiased relative">
      
      {/* HEADER LOGIN FLOATING (Tetap ada di semua template) */}
      <header className="absolute top-0 w-full p-4 flex justify-end items-center z-50">
        <Link href="/dashboard" className="text-xs font-bold px-4 py-2 bg-white/70 hover:bg-white rounded-full transition-colors backdrop-blur-sm shadow-md text-emerald-900 border border-emerald-100 flex items-center gap-1.5">
           Login Takmir <Users className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* RENDER TEMPLATE YANG DIPILIH */}
      <SelectedTemplate data={mockPublicData} />

    </div>
  );
}