import Link from "next/link";
import { ArrowLeft, Receipt, CheckCircle2, Clock, XCircle, Calendar, Target, Hash } from "lucide-react";
import { CopyToClipboard } from "../../../../../../components/ui/InteractiveText";

export const dynamic = "force-dynamic";

// Helper Format Rupiah
const formatRp = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

// Helper Warna Metode Pembayaran
const getMethodStyle = (method: string) => {
  const m = method.toLowerCase();
  if (m.includes('qris')) return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (m.includes('transfer')) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (m.includes('gopay')) return "bg-sky-50 text-sky-700 border-sky-200";
  if (m.includes('ovo')) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

export default async function CampaignTransactionsPage({ params }: { params: { id: string } }) {
  // MOCK DATA: Kampanye (Diperbarui dengan gambar untuk Hero Card)
  const mockCampaign = {
    id: params.id,
    title: "Pembebasan Lahan Parkir Masjid",
    image_url: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800",
    target_amount: 150000000,
    collected_amount: 45500000,
    end_date: "2026-08-31T00:00:00Z"
  };

  // MOCK DATA: Transaksi
  const mockTransactions = [
    { id: "INV-20260324-001", donor_name: "Pison Golda", is_anonymous: false, amount: 500000, method: "QRIS", status: "paid", date: "2026-03-24T10:00:00Z" },
    { id: "INV-20260324-002", donor_name: "Budi Santoso", is_anonymous: true, amount: 150000, method: "Transfer BCA", status: "paid", date: "2026-03-24T09:15:00Z" },
    { id: "INV-20260324-003", donor_name: "Siti Aminah", is_anonymous: false, amount: 1000000, method: "Gopay", status: "pending", date: "2026-03-24T11:30:00Z" },
    { id: "INV-20260323-004", donor_name: "Andi", is_anonymous: false, amount: 50000, method: "OVO", status: "expired", date: "2026-03-23T15:00:00Z" },
  ];

  const progressPercentage = Math.min(Math.round((mockCampaign.collected_amount / mockCampaign.target_amount) * 100), 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Tombol Kembali */}
      <Link href="/dashboard/finance/campaigns" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Program
      </Link>

      {/* ========================================== */}
      {/* HERO CARD PROGRAM (Perbaikan Layout & Gambar Kecil) */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5 w-full flex flex-col md:flex-row gap-5 items-center md:items-center overflow-hidden relative">
        {/* Dekorasi Glow Ringan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50"></div>

        {/* 1. Kiri: Thumbnail Gambar (Dibuat jauh lebih kecil dan compact) */}
        <div className="w-full sm:w-24 sm:h-24 md:w-32 md:h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
          <img src={mockCampaign.image_url} alt="Thumbnail Program" className="w-full h-full object-cover" />
        </div>

        {/* 2. Tengah: Info Elegan */}
        <div className="flex-1 flex flex-col justify-center w-full">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 mb-1.5 w-max">
            <Hash className="w-3 h-3" /> ID: {mockCampaign.id}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight mb-1">{mockCampaign.title}</h2>
          <p className="text-gray-500 text-xs flex items-center gap-1.5 font-medium">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Riwayat Transaksi Donatur
          </p>
        </div>

        {/* Divider Vertikal (Hanya tampil di Desktop) */}
        <div className="hidden md:block w-px h-16 bg-gray-200 mx-2"></div>

        {/* 3. Kanan: Progress Target */}
        <div className="w-full md:w-72 flex flex-col justify-center shrink-0">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-500"/> Progres
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-[10px]">
              <Calendar className="w-3 h-3"/> {new Date(mockCampaign.end_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-lg font-bold text-gray-900 leading-none">{formatRp(mockCampaign.collected_amount)}</span>
              <span className="text-gray-400 font-medium text-[10px] leading-none mb-0.5">dari {formatRp(mockCampaign.target_amount)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* TABEL TRANSAKSI */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">ID Transaksi / Waktu</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Nama Donatur</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Nominal (Rp)</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-center">Metode</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-5 py-4">
                    {/* PERBAIKAN: Implementasi CopyToClipboard untuk ID Transaksi */}
                    <div className="font-bold text-gray-900 font-mono text-xs mb-0.5">
                      <CopyToClipboard text={trx.id} display={trx.id} />
                    </div>
                    <p className="text-[11px] text-gray-500">{new Date(trx.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`font-bold ${trx.is_anonymous ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                      {trx.is_anonymous ? "Hamba Allah" : trx.donor_name}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-bold text-emerald-700">
                      {new Intl.NumberFormat("id-ID").format(trx.amount)}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-[110px] px-2 py-1.5 border rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getMethodStyle(trx.method)}`}>
                      {trx.method}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {trx.status === "paid" && (
                      <span className="inline-flex items-center justify-center w-[110px] gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Berhasil</span>
                    )}
                    {trx.status === "pending" && (
                      <span className="inline-flex items-center justify-center w-[110px] gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Menunggu</span>
                    )}
                    {trx.status === "expired" && (
                      <span className="inline-flex items-center justify-center w-[110px] gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> Batal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}