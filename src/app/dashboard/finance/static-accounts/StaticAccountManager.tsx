"use client";

import { useState, useTransition, useRef } from "react";
import { 
  createStaticPaymentMethod, 
  updateStaticPaymentMethod, 
  deleteStaticPaymentMethod 
} from "../../../actions/finance";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { useToast } from "../../../../components/ui/Toast";
import { CopyToClipboard, ConfirmRedirect } from "../../../../components/ui/InteractiveText";
import { Plus, Edit3, Trash2, Save, X, CreditCard, QrCode, ChevronDown } from "lucide-react";

// ==========================================
// KOMPONEN CUSTOM DROPDOWN UNTUK TABEL
// ==========================================
const InlineStatusSelect = ({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  disabled: boolean 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isPublic = value === "true";

  return (
    <div className="relative w-full min-w-[160px]">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-xs font-bold px-3 py-2.5 rounded-md border outline-none cursor-pointer transition-all shadow-sm disabled:opacity-50 ${
          isPublic
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
        }`}
      >
        <span>{isPublic ? "Tampil (Publik)" : "Sembunyikan"}</span>
        {/* Ikon panah dengan animasi rotasi saat terbuka */}
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ml-3 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Pop-up Menu */}
      {isOpen && (
        <>
          {/* Overlay transparan untuk menutup dropdown jika klik di luar */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 shadow-xl rounded-md z-50 overflow-hidden text-xs py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={() => { onChange("true"); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 font-bold transition-colors ${isPublic ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              Tampil (Publik)
            </button>
            <button
              type="button"
              onClick={() => { onChange("false"); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 font-bold transition-colors ${!isPublic ? "bg-gray-100 text-gray-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              Sembunyikan
            </button>
          </div>
        </>
      )}
    </div>
  );
};


export default function StaticAccountManager({ initialChannels }: { initialChannels: any[] }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  
  const [editingChannel, setEditingChannel] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [channelType, setChannelType] = useState<"bank_account" | "qris">("bank_account");
  
  const formRef = useRef<HTMLDivElement>(null);

  const handleAddNewClick = () => {
    setEditingChannel(null);
    setChannelType("bank_account");
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleEditClick = (channel: any) => {
    setEditingChannel(channel);
    setChannelType(channel.channel_type as "bank_account" | "qris");
    setIsFormVisible(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = (id: number, label: string) => {
    if (!window.confirm(`Yakin ingin menghapus metode pembayaran "${label}"?`)) return;
    startTransition(async () => {
      const res = await deleteStaticPaymentMethod(id);
      if (res.error) addToast(res.error, "error");
      else addToast("Berhasil menghapus metode pembayaran statis.", "success");
    });
  };

  const handleQuickStatusChange = (channel: any, newStatus: string) => {
    if (String(channel.is_public) === newStatus) return; // Cegah update jika status sama
    
    const isPublic = newStatus === "true";
    startTransition(async () => {
      const payload = { ...channel, is_public: isPublic };
      const submitData = new FormData();
      submitData.append("payload", JSON.stringify(payload));
      
      const res = await updateStaticPaymentMethod(submitData);
      if (res.error) addToast("Gagal memperbarui status", "error");
      else addToast(`Status ${channel.label} diperbarui!`, "success");
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      if (key === 'sort_order') {
        payload[key] = parseInt(value as string, 10) || 0;
      } else if (key === 'is_public') {
        payload[key] = value === 'true';
      } else {
        payload[key] = value;
      }
    }

    if (payload.channel_type === "qris") {
      delete payload.bank_name; delete payload.bank_branch; delete payload.account_number; delete payload.account_holder_name;
    } else {
      delete payload.qris_image_url; delete payload.merchant_id;
    }

    if (editingChannel) payload.id = editingChannel.id;

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      const res = editingChannel ? await updateStaticPaymentMethod(submitData) : await createStaticPaymentMethod(submitData);
      if (res.error) {
        addToast(res.error, "error");
      } else {
        addToast(`Berhasil ${editingChannel ? "memperbarui" : "menambah"} metode pembayaran.`, "success");
        setIsFormVisible(false);
        setEditingChannel(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* BAGIAN TABEL */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Daftar Rekening & QRIS Manual</h3>
            <p className="text-xs text-gray-500 mt-0.5">Metode transfer statis tanpa verifikasi otomatis.</p>
          </div>
          <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Tambah Rekening
          </button>
        </div>

        {/* pb-32 memberikan ruang ekstra untuk custom dropdown agar tidak terpotong overflow */}
        <div className="overflow-x-auto pb-32">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Label / Tujuan</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-center">Metode</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Detail Akun</th>
                <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px] w-48">Status Publikasi</th>
                <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialChannels.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada metode pembayaran statis terdaftar.</td></tr>
              ) : (
                initialChannels.sort((a,b) => a.sort_order - b.sort_order).map((channel) => (
                  <tr key={channel.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{channel.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{channel.description || "-"}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {channel.channel_type === 'qris' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100"><QrCode className="w-3.5 h-3.5" /> QRIS</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100"><CreditCard className="w-3.5 h-3.5" /> Transfer</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {channel.channel_type === 'bank_account' ? (
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2">{channel.bank_name} - <CopyToClipboard text={channel.account_number} display={channel.account_number} /></p>
                          <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">A.N. {channel.account_holder_name}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <ConfirmRedirect url={channel.qris_image_url} display="Lihat Barcode QRIS" />
                          {channel.merchant_id && <p className="text-[10px] text-gray-500 uppercase mt-0.5">NMID: {channel.merchant_id}</p>}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                       {/* PEMANGGILAN CUSTOM DROPDOWN */}
                       <InlineStatusSelect 
                          value={String(channel.is_public)} 
                          onChange={(val) => handleQuickStatusChange(channel, val)}
                          disabled={isPending}
                       />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(channel)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 shadow-sm"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(channel.id, channel.label)} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 shadow-sm disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BAGIAN FORM ENTRY */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">{editingChannel ? "Edit Rekening/QRIS" : "Tambah Rekening Baru"}</h3>
              <p className="text-emerald-200 text-xs mt-0.5">Informasi rekening statis untuk menerima transfer manual.</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full"><X className="w-5 h-5" /></button>
          </div>

          <form key={editingChannel ? editingChannel.id : "new-channel"} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Label / Peruntukan <span className="text-rose-500">*</span></label>
                <input type="text" name="label" defaultValue={editingChannel?.label} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: Rekening Operasional Masjid" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Metode <span className="text-rose-500">*</span></label>
                <div onClick={() => !editingChannel} className={editingChannel ? "opacity-70 pointer-events-none" : ""}>
                  <CustomSelect name="channel_type" defaultValue={channelType} onChange={(val) => setChannelType(val as any)} options={[{ label: "Transfer Rekening Bank", value: "bank_account" }, { label: "Scan Barcode QRIS Statis", value: "qris" }]} />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/80 space-y-4">
              {channelType === "bank_account" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Bank <span className="text-rose-500">*</span></label><input type="text" name="bank_name" defaultValue={editingChannel?.bank_name} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: BSI / Mandiri" /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Kantor Cabang</label><input type="text" name="bank_branch" defaultValue={editingChannel?.bank_branch} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: KCP Sudirman" /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor Rekening <span className="text-rose-500">*</span></label><input type="text" name="account_number" defaultValue={editingChannel?.account_number} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm font-mono placeholder:text-gray-400" placeholder="Cth: 1234567890" /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Atas Nama (A.N) <span className="text-rose-500">*</span></label><input type="text" name="account_holder_name" defaultValue={editingChannel?.account_holder_name} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: Masjid Jami Al-Ikhlas" /></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Gambar Barcode QRIS <span className="text-rose-500">*</span></label><input type="url" name="qris_image_url" defaultValue={editingChannel?.qris_image_url} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="https://..." /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-700 mb-1.5">NMID / ID Merchant</label><input type="text" name="merchant_id" defaultValue={editingChannel?.merchant_id} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: ID123456789" /></div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
              <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Tambahan</label><textarea name="description" defaultValue={editingChannel?.description} rows={4} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: Mohon tambahkan kode unik 001 di akhir..."></textarea></div>
              <div className="space-y-6">
                <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Status Tampil</label><CustomSelect name="is_public" defaultValue={editingChannel ? String(editingChannel.is_public) : "true"} options={[{ label: "Publik (Tampil)", value: "true" }, { label: "Sembunyikan", value: "false" }]} disabled={isPending} /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan</label><input type="number" name="sort_order" defaultValue={editingChannel?.sort_order ?? 0} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm" /></div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
              <button type="button" onClick={() => setIsFormVisible(false)} disabled={isPending} className="text-gray-500 hover:bg-gray-100 text-sm font-bold py-2.5 px-6 rounded-lg transition-colors border border-transparent">Batal</button>
              <button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
                {isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> {editingChannel ? "Simpan Perubahan" : "Simpan Rekening"}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}