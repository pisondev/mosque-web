import { Settings } from "lucide-react";
import PGSettingsForm from "./PGSettingsForm";
import { getPgConfig } from "../../../actions/finance";

export const dynamic = "force-dynamic";

export default async function PGSettingsPage() {
  // Ambil data dari database melalui fungsi yang kita buat
  const response = await getPgConfig();
  const initialConfig = response?.data || { use_central_pg: true, provider: "midtrans", client_key: "" };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pengaturan Payment Gateway</h2>
          <p className="text-gray-500 text-sm mt-1">
            Konfigurasikan jalur penerimaan dana otomatis untuk program donasi Anda.
          </p>
        </div>
      </div>

      {/* Masukkan form yang sudah di-split */}
      <PGSettingsForm initialConfig={initialConfig} />
    </div>
  );
}