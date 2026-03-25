"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import CustomDateInput from "../../../../components/ui/CustomDateInput";
import { Plus, Edit3, Trash2, Save, X, Users, Calendar, Image as ImageIcon, UploadCloud, ChevronDown, Settings } from "lucide-react";
import Link from "next/link";
import { createCampaign, updateCampaign } from "../../../actions/finance";
import { useToast } from "../../../../components/ui/Toast";

// Format Rupiah Tampilan
const formatRp = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

// ==========================================
// CUSTOM DROPDOWN STATUS AKTIF/TUTUP (Warna Dinamis)
// ==========================================
const ActiveStatusSelect = ({ value, onChange, disabled }: { value: boolean, onChange: (val: boolean) => void, disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-bold outline-none shadow-sm transition-colors disabled:opacity-50 ${
          value 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
        }`}
      >
        <span>{value ? "Aktif (Bisa Menerima Donasi)" : "Tutup / Selesai"}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 shadow-xl rounded-md z-50 overflow-hidden text-sm py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div onClick={() => { onChange(true); setIsOpen(false); }} className={`px-4 py-2.5 transition-colors cursor-pointer font-bold ${value ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"}`}>
              Aktif (Bisa Menerima Donasi)
            </div>
            <div onClick={() => { onChange(false); setIsOpen(false); }} className={`px-4 py-2.5 transition-colors cursor-pointer font-bold ${!value ? "bg-rose-50 text-rose-700" : "text-gray-600 hover:bg-rose-50 hover:text-rose-700"}`}>
              Tutup / Selesai
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function CampaignManager({ initialCampaigns }: { initialCampaigns: any[] }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // STATE UNTUK INPUT DINAMIS
  const [displayAmount, setDisplayAmount] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  
  // STATE DRAG & DROP GAMBAR
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNewClick = () => {
    setEditingCampaign(null);
    setDisplayAmount("");
    setImageUrl("");
    setIsActive(true);
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleEditClick = (campaign: any) => {
    setEditingCampaign(campaign);
    // Format angka awal saat edit
    setDisplayAmount(new Intl.NumberFormat("id-ID").format(campaign.target_amount || 0));
    setImageUrl(campaign.image_url || "");
    setIsActive(campaign.is_active);
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  // LOGIKA FORMAT UANG OTOMATIS (Ribuan)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Hapus semua selain angka
    if (!rawValue) {
      setDisplayAmount("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(rawValue, 10));
    setDisplayAmount(formatted);
  };

  // LOGIKA DRAG & DROP GAMBAR
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast("File harus berupa gambar (JPG/PNG)", "error");
      return;
    }
    // MOCK: Membuat URL lokal untuk preview (Nanti diganti upload API)
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
  };

  const handleDeleteAttempt = () => {
    alert("Program donasi tidak dapat dihapus untuk menjaga riwayat transaksi keuangan. Silakan Edit dan ubah statusnya menjadi 'Tutup / Selesai'.");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      
      // Ambil nilai selain input custom kita
      if (key !== 'display_amount' && key !== 'image_file') {
        if (key === 'start_date' || key === 'end_date') {
          payload[key] = new Date(value as string).toISOString();
        } else {
          payload[key] = value;
        }
      }
    }

    // Masukkan data dari state custom
    payload['target_amount'] = parseInt(displayAmount.replace(/\./g, ""), 10) || 0;
    payload['is_active'] = isActive;
    payload['image_url'] = imageUrl; // Kirim URL gambar ke backend

    if (editingCampaign) payload.id = editingCampaign.id;

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      const res = editingCampaign ? await updateCampaign(submitData) : await createCampaign(submitData);
      if (res.error) {
        addToast(res.error, "error");
      } else {
        addToast(`Berhasil ${editingCampaign ? "memperbarui" : "menerbitkan"} program donasi.`, "success");
        setIsFormVisible(false);
        setEditingCampaign(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* HEADER & ADD BUTTON */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-800 text-lg">Daftar Program</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Tombol Pintasan ke Settings Payment Gateway */}
          <Link href="/dashboard/finance/settings" className="p-2.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" title="Pengaturan Payment Gateway">
            <Settings className="w-5 h-5" />
          </Link>
          <button onClick={handleAddNewClick} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Buat Program Baru
          </button>
        </div>
      </div>

      {/* GRID KARTU PROGRAM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCampaigns.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <p className="text-gray-400 font-medium">Belum ada program donasi. Buat program pertama Anda!</p>
          </div>
        ) : (
          initialCampaigns.map((campaign) => {
            const collected = campaign.collected_amount || 0;
            const target = campaign.target_amount || 1;
            const progressPercentage = Math.min(Math.round((collected / target) * 100), 100);
            const isTargetReached = collected >= target;

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
                      <span className="font-semibold text-emerald-700">{formatRp(collected)}</span>
                      <span className="text-gray-500 text-[10px] uppercase">Target: {formatRp(target)}</span>
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
                  <Link 
                    href={`/dashboard/finance/campaigns/${campaign.id}/transactions`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" /> Lihat Donatur
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(campaign)} disabled={isPending} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={handleDeleteAttempt} disabled={isPending} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FORM ENTRY */}
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
              
              {/* Kolom Kiri */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Program <span className="text-rose-500">*</span></label>
                  <input type="text" name="title" defaultValue={editingCampaign?.title} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: Pembebasan Lahan Parkir" />
                  <p className="text-[10px] text-gray-500 mt-1.5">Sistem otomatis membuat URL (slug) dari judul ini.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Dana (Rp) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-gray-500 text-sm font-semibold">Rp</span>
                    <input 
                      type="text" 
                      name="display_amount" 
                      value={displayAmount} 
                      onChange={handleAmountChange} 
                      required 
                      disabled={isPending} 
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm font-mono placeholder:text-gray-400" 
                      placeholder="50.000.000" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Mulai <span className="text-rose-500">*</span></label>
                    <CustomDateInput name="start_date" defaultValue={editingCampaign?.start_date?.split('T')[0]} required disabled={isPending} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Batas Akhir <span className="text-rose-500">*</span></label>
                    <CustomDateInput name="end_date" defaultValue={editingCampaign?.end_date?.split('T')[0]} required disabled={isPending} />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan (Drag & Drop Gambar) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Thumbnail Program <span className="text-rose-500">*</span></label>
                
                <div 
                  className={`relative w-full h-[216px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all cursor-pointer overflow-hidden ${
                    isDragging ? "border-emerald-500 bg-emerald-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }} 
                  />
                  
                  {imageUrl ? (
                    <div className="absolute inset-0 group">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-bold flex items-center gap-2"><Edit3 className="w-4 h-4"/> Ganti Gambar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-emerald-600">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-700">Pilih Gambar atau Tarik Kesini</p>
                      <p className="text-xs text-gray-500 mt-1">Mendukung JPG, PNG (Max. 2MB)</p>
                    </div>
                  )}
                </div>
                {/* Input tersembunyi jika fallback menggunakan URL langsung */}
                <input type="hidden" name="image_url" value={imageUrl} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Lengkap Program</label>
                <textarea name="description" defaultValue={editingCampaign?.description} rows={5} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Ceritakan tujuan program donasi ini secara detail untuk menarik simpati..."></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status Program</label>
                <div className="max-w-sm">
                  <ActiveStatusSelect value={isActive} onChange={setIsActive} disabled={isPending} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
              <button type="button" onClick={() => setIsFormVisible(false)} disabled={isPending} className="text-gray-500 hover:bg-gray-100 text-sm font-bold py-2.5 px-6 rounded-lg transition-colors border border-transparent">Batal</button>
              <button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
                {isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> {editingCampaign ? "Simpan Perubahan" : "Terbitkan Program"}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}