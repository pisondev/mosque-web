"use client";

import { useState, useRef } from "react";
import CustomSelect from "../../../../components/ui/CustomSelect";
import Link from "next/link";
import { Plus, Edit3, Trash2, Save, X, Users, Calendar, Image as ImageIcon } from "lucide-react";

// Format Rupiah
const formatRp = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

export default function CampaignManager({ initialCampaigns }: { initialCampaigns: any[] }) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);

  const handleAddNewClick = () => {
    setEditingCampaign(null);
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleEditClick = (campaign: any) => {
    setEditingCampaign(campaign);
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Ini adalah Mock UI. Data form belum dikirim ke backend.");
    setIsFormVisible(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER & ADD BUTTON */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg">Daftar Program</h3>
        <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
          <Plus className="w-4 h-4" /> Buat Program Baru
        </button>
      </div>

      {/* GRID KARTU PROGRAM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCampaigns.map((campaign) => {
          const progressPercentage = Math.min(Math.round((campaign.collected_amount / campaign.target_amount) * 100), 100);
          const isTargetReached = campaign.collected_amount >= campaign.target_amount;

          return (
            <div key={campaign.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  {campaign.is_active ? (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Aktif</span>
                  ) : (
                    <span className="bg-gray-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Selesai</span>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{campaign.title}</h4>
                
                <div className="mt-auto pt-4 space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-emerald-700">{formatRp(campaign.collected_amount)}</span>
                    <span className="text-gray-500 text-[10px] uppercase">Target: {formatRp(campaign.target_amount)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${isTargetReached ? 'bg-emerald-500' : 'bg-emerald-400'}`} style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium pt-1">
                    <span>{progressPercentage}% Terkumpul</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(campaign.end_date).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 flex justify-between items-center">
                {/* PERBAIKAN: Mengganti button menjadi Link agar bisa diklik menuju halaman transaksi */}
                <Link 
                  href={`/dashboard/finance/campaigns/${campaign.id}/transactions`}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" /> Lihat Donatur
                </Link>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(campaign)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"><Edit3 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM ENTRY (MOCK) */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">{editingCampaign ? "Edit Program" : "Buat Program Baru"}</h3>
              <p className="text-emerald-200 text-xs mt-0.5">Lengkapi detail penggalangan dana Anda.</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Program <span className="text-rose-500">*</span></label>
                {/* PERBAIKAN 4: text-gray-900 bg-white */}
                <input type="text" name="title" defaultValue={editingCampaign?.title} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: Pembebasan Lahan Parkir" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Dana (Rp) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-500 text-sm font-semibold">Rp</span>
                  <input type="number" name="target_amount" defaultValue={editingCampaign?.target_amount} required className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm font-mono placeholder:text-gray-400" placeholder="50000000" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Gambar Thumbnail <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400"><ImageIcon className="w-4 h-4"/></span>
                  <input type="url" name="image_url" defaultValue={editingCampaign?.image_url} required className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Mulai <span className="text-rose-500">*</span></label>
                <input type="date" name="start_date" defaultValue={editingCampaign?.start_date?.split('T')[0]} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Batas Akhir (Deadline) <span className="text-rose-500">*</span></label>
                <input type="date" name="end_date" defaultValue={editingCampaign?.end_date?.split('T')[0]} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Lengkap Program</label>
                <textarea name="description" defaultValue={editingCampaign?.description} rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Ceritakan tujuan program donasi ini secara detail..."></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status Program</label>
                <div className="max-w-xs">
                  <CustomSelect name="is_active" defaultValue={editingCampaign ? String(editingCampaign.is_active) : "true"} options={[{ label: "Aktif (Bisa Menerima Donasi)", value: "true" }, { label: "Tutup / Selesai", value: "false" }]} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
              <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-500 hover:bg-gray-100 text-sm font-bold py-2.5 px-6 rounded-lg transition-colors border border-transparent">Batal</button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
                <Save className="w-4 h-4"/> {editingCampaign ? "Simpan Perubahan" : "Terbitkan Program"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}