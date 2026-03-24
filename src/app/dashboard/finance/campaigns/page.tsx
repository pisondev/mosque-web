import CampaignManager from "./CampaignManager";
import { Target } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  // MOCK DATA
  const mockCampaigns = [
    {
      id: 1,
      title: "Pembebasan Lahan Parkir Masjid",
      slug: "pembebasan-lahan-parkir",
      description: "Penggalangan dana untuk membebaskan lahan seluas 200m2 di sebelah barat masjid untuk area parkir jamaah.",
      image_url: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800",
      target_amount: 150000000,
      collected_amount: 45500000,
      start_date: "2026-03-01T00:00:00Z",
      end_date: "2026-08-31T00:00:00Z",
      is_active: true
    },
    {
      id: 2,
      title: "Santunan Yatim & Dhuafa Ramadhan",
      slug: "santunan-yatim-ramadhan",
      description: "Program berbagi kebahagiaan bersama 100 anak yatim dan dhuafa di sekitar lingkungan masjid selama bulan suci.",
      image_url: "https://images.unsplash.com/photo-1593113565694-c6c878e3c1a3?auto=format&fit=crop&q=80&w=800",
      target_amount: 25000000,
      collected_amount: 25000000,
      start_date: "2026-02-15T00:00:00Z",
      end_date: "2026-03-20T00:00:00Z",
      is_active: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Program Donasi</h2>
          <p className="text-gray-500 text-sm mt-1">
            Buat dan kelola program galang dana dengan target nominal. Untuk rekening manual, gunakan menu <Link href="/dashboard/finance/static-accounts" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline decoration-emerald-300 underline-offset-4 transition-all">Rekening & QRIS</Link>.
          </p>
        </div>
      </div>

      <CampaignManager initialCampaigns={mockCampaigns} />
    </div>
  );
}