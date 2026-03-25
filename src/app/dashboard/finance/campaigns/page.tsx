import CampaignManager from "./CampaignManager";
import { Target } from "lucide-react";
import Link from "next/link";
import { listCampaigns } from "../../../actions/finance";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  // Mengambil data asli dari database peladen
  const response = await listCampaigns(1, 50);
  const campaigns = Array.isArray(response?.data) ? response.data : [];

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

      <CampaignManager initialCampaigns={campaigns} />
    </div>
  );
}