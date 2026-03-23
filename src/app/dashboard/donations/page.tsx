import { listDonationChannels } from "../../actions/engagement";
import DonationManager from "./DonationManager";

export default async function DonationsPage() {
  const channelsRes = await listDonationChannels(1, 50);
  const channels = Array.isArray(channelsRes?.data) ? channelsRes.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-800">Kanal Donasi & Keuangan</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelola rekening bank dan QRIS masjid untuk ditampilkan pada halaman publik jamaah.
        </p>
      </div>

      <DonationManager initialChannels={channels} />
    </div>
  );
}