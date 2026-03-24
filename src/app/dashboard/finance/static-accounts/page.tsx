import { listStaticPaymentMethods } from "../../../actions/finance";
import StaticAccountManager from "./StaticAccountManager";
import { Landmark } from "lucide-react";
import Link from "next/link";

export default async function StaticAccountsPage() {
  const response = await listStaticPaymentMethods(1, 50);
  const accounts = Array.isArray(response?.data) ? response.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Rekening & QRIS Masjid</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola metode transfer statis yang akan ditampilkan ke jamaah. Untuk program galang dana, gunakan menu <Link href="/dashboard/finance/campaigns" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline decoration-emerald-300 underline-offset-4 transition-all">Program Donasi</Link>.
          </p>
        </div>
      </div>

      <StaticAccountManager initialChannels={accounts} />
    </div>
  );
}