import Link from "next/link";
import { ArrowLeft, Receipt, CheckCircle2, Clock, XCircle, Calendar, Target, Hash } from "lucide-react";
import { CopyToClipboard } from "../../../../../../components/ui/InteractiveText";
// Perbaikan path import sesuai catatanmu:
import { getCampaignById, listCampaignTransactions } from "../../../../../actions/finance";

export const dynamic = "force-dynamic";

// MENGATASI ERROR TYPESCRIPT: Mendefinisikan bentuk data transaksi
interface Transaction {
  id?: string;
  transaction_id?: string;
  donor_name?: string;
  is_anonymous?: boolean;
  amount?: number;
  payment_method?: string;
  status?: string;
  paid_at?: string;
  created_at?: string;
}

// Helper Format Rupiah
const formatRp = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

// Helper Warna Metode Pembayaran
const getMethodStyle = (method: string) => {
  if (!method) return "bg-gray-50 text-gray-700 border-gray-200";
  const m = method.toLowerCase();
  if (m.includes('qris')) return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (m.includes('transfer')) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (m.includes('gopay')) return "bg-sky-50 text-sky-700 border-sky-200";
  if (m.includes('ovo')) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

export default async function CampaignTransactionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaignRes, transactionsRes] = await Promise.all([
    getCampaignById(id),
    listCampaignTransactions(id, 1, 100)
  ]);

  const campaign = campaignRes?.data;
  // Memastikan TypeScript tahu bahwa array ini berisi sekumpulan object Transaction
  const transactions: Transaction[] = Array.isArray(transactionsRes?.data) ? transactionsRes.data : [];

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <p className="text-gray-500 mb-4">Program donasi tidak ditemukan atau telah dihapus.</p>
        <Link href="/dashboard/finance/campaigns" className="text-emerald-600 font-bold hover:underline">Kembali ke Daftar Program</Link>
      </div>
    );
  }

  const collected = campaign.collected_amount || 0;
  const target = campaign.target_amount || 1;
  const progressPercentage = Math.min(Math.round((collected / target) * 100), 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Link href="/dashboard/finance/campaigns" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Program
      </Link>

      {/* HERO CARD PROGRAM */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5 w-full flex flex-col md:flex-row gap-5 items-center md:items-center overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50"></div>

        <div className="w-full sm:w-24 sm:h-24 md:w-32 md:h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
          <img src={campaign.image_url} alt="Thumbnail Program" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 flex flex-col justify-center w-full">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 mb-1.5 w-max">
            <Hash className="w-3 h-3" /> ID: {campaign.id}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight mb-1">{campaign.title}</h2>
          <p className="text-gray-500 text-xs flex items-center gap-1.5 font-medium">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Riwayat Transaksi Donatur
          </p>
        </div>

        <div className="hidden md:block w-px h-16 bg-gray-200 mx-2"></div>

        <div className="w-full md:w-72 flex flex-col justify-center shrink-0">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-500"/> Progres
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-[10px]">
              <Calendar className="w-3 h-3"/> {new Date(campaign.end_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-lg font-bold text-gray-900 leading-none">{formatRp(collected)}</span>
              <span className="text-gray-400 font-medium text-[10px] leading-none mb-0.5">dari {formatRp(target)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* TABEL TRANSAKSI */}
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
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 bg-gray-50/50">Belum ada transaksi donasi untuk program ini.</td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id || trx.transaction_id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 font-mono text-xs mb-0.5">
                        <CopyToClipboard text={trx.id || trx.transaction_id || "-"} display={trx.id || trx.transaction_id || "-"} />
                      </div>
                      <p className="text-[11px] text-gray-500">{trx.paid_at ? new Date(trx.paid_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : new Date(trx.created_at || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className={`font-bold ${trx.is_anonymous ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                        {trx.is_anonymous ? "Hamba Allah" : (trx.donor_name || "-")}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-bold text-emerald-700">
                        {new Intl.NumberFormat("id-ID").format(trx.amount || 0)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-[110px] px-2 py-1.5 border rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getMethodStyle(trx.payment_method || "")}`}>
                        {trx.payment_method || "System"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {trx.status === "paid" && <span className="inline-flex items-center justify-center w-[110px] gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Berhasil</span>}
                      {trx.status === "pending" && <span className="inline-flex items-center justify-center w-[110px] gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Menunggu</span>}
                      {trx.status === "expired" && <span className="inline-flex items-center justify-center w-[110px] gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> Batal</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
