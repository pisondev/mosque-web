"use client";

import { useState, useTransition, useRef } from "react";
import { createDonationChannel, updateDonationChannel, deleteDonationChannel } from "../../actions/engagement";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useToast } from "../../../components/ui/Toast";
import { CopyToClipboard, ConfirmRedirect } from "../../../components/ui/InteractiveText";
import { Plus, Edit3, Trash2, Save, X, CreditCard, QrCode, ExternalLink } from "lucide-react";

export default function DonationManager({ initialChannels }: { initialChannels: any[] }) {
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
    if (!window.confirm(`Yakin ingin menghapus kanal donasi "${label}"?`)) return;
    startTransition(async () => {
      const res = await deleteDonationChannel(id);
      if (res.error) addToast(res.error, "error");
      else addToast("Berhasil menghapus kanal donasi.", "success");
    });
  };

  // Quick Action: Ubah Status Langsung dari Tabel
  const handleQuickStatusChange = (channel: any, newStatus: string) => {
    const isPublic = newStatus === "true";
    startTransition(async () => {
      const payload = { ...channel, is_public: isPublic };
      const submitData = new FormData();
      submitData.append("payload", JSON.stringify(payload));
      
      const res = await updateDonationChannel(submitData);
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
      delete payload.bank_name;
      delete payload.bank_branch;
      delete payload.account_number;
      delete payload.account_holder_name;
    } else if (payload.channel_type === "bank_account") {
      delete payload.qris_image_url;
      delete payload.merchant_id;
    }

    if (editingChannel) payload.id = editingChannel.id;

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      const res = editingChannel ? await updateDonationChannel(submitData) : await createDonationChannel(submitData);
      
      if (res.error) {
        addToast(res.error, "error");
      } else {
        addToast(`Berhasil ${editingChannel ? "memperbarui" : "menambah"} kanal donasi.`, "success");
        setIsFormVisible(false);
        setEditingChannel(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ========================================= */}
      {/* BAGIAN TABEL */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Daftar Kanal Terdaftar</h3>
            <p className="text-xs text-gray-500 mt-0.5">Rekening dan QRIS untuk menerima infaq jamaah.</p>
          </div>
          <button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
            <Plus className="w-4 h-4" />
            Tambah Kanal
          </button>
        </div>

        {/* pb-24 agar CustomSelect di baris terakhir tidak terpotong overflow */}
        <div className="overflow-x-auto pb-24">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Label / Tujuan</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-center">Metode</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Detail Akun</th>
                <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px] w-40">Status Publikasi</th>
                <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialChannels.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada kanal donasi.</td></tr>
              ) : (
                initialChannels.sort((a,b) => a.sort_order - b.sort_order).map((channel) => (
                  <tr key={channel.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{channel.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{channel.description || "-"}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {channel.channel_type === 'qris' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <QrCode className="w-3.5 h-3.5" /> QRIS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CreditCard className="w-3.5 h-3.5" /> Transfer
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {channel.channel_type === 'bank_account' ? (
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2">
                            {channel.bank_name} - <CopyToClipboard text={channel.account_number} display={channel.account_number} />
                          </p>
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
                       {/* QUICK STATUS DROPDOWN */}
                       <div className="w-full min-w-[150px]">
                        <CustomSelect
                          name={`is_public-${channel.id}`}
                          defaultValue={String(channel.is_public)}
                          disabled={isPending}
                          onChange={(val) => handleQuickStatusChange(channel, val)}
                          options={[
                            { label: "Publik (Tampil)", value: "true" },
                            { label: "Sembunyikan", value: "false" }
                          ]}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(channel)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(channel.id, channel.label)} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* BAGIAN FORM ENTRY */}
      {/* ========================================= */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">{editingChannel ? "Edit Kanal Donasi" : "Tambah Kanal Donasi Baru"}</h3>
              <p className="text-emerald-200 text-xs mt-0.5">{editingChannel ? `ID: #${editingChannel.id} | Perbarui informasi tujuan donasi.` : "Lengkapi informasi rekening atau QRIS."}</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form key={editingChannel ? editingChannel.id : "new-channel"} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Label / Peruntukan Donasi <span className="text-rose-500">*</span></label>
                <input type="text" name="label" defaultValue={editingChannel?.label} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm disabled:bg-gray-100" placeholder="Cth: Infaq Operasional Masjid" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Metode Pembayaran <span className="text-rose-500">*</span></label>
                <div onClick={() => !editingChannel} className={editingChannel ? "opacity-70 pointer-events-none" : ""}>
                  <CustomSelect 
                    name="channel_type" 
                    defaultValue={channelType} 
                    onChange={(val) => setChannelType(val as any)}
                    options={[
                      { label: "Transfer Bank Rekening", value: "bank_account" },
                      { label: "Scan Barcode QRIS", value: "qris" }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* DYNAMIC FIELDS BERDASARKAN TIPE PEMBAYARAN */}
            <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/80 space-y-4">
              <h4 className="text-xs font-bold tracking-widest text-emerald-800 uppercase mb-4 flex items-center gap-2">
                {channelType === "bank_account" ? <><CreditCard className="w-4 h-4"/> Detail Rekening Bank</> : <><QrCode className="w-4 h-4"/> Detail Barcode QRIS</>}
              </h4>

              {channelType === "bank_account" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Bank <span className="text-rose-500">*</span></label>
                    <input type="text" name="bank_name" defaultValue={editingChannel?.bank_name} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm bg-white disabled:bg-gray-100" placeholder="Cth: BSI / Mandiri / BCA" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kantor Cabang (Opsional)</label>
                    <input type="text" name="bank_branch" defaultValue={editingChannel?.bank_branch} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm bg-white disabled:bg-gray-100" placeholder="Cth: KCP Sudirman" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor Rekening <span className="text-rose-500">*</span></label>
                    <input type="text" name="account_number" defaultValue={editingChannel?.account_number} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm bg-white font-mono disabled:bg-gray-100" placeholder="Cth: 1234567890" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Atas Nama (A.N) <span className="text-rose-500">*</span></label>
                    <input type="text" name="account_holder_name" defaultValue={editingChannel?.account_holder_name} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm bg-white disabled:bg-gray-100" placeholder="Cth: Masjid Jami Al-Ikhlas" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Gambar Barcode QRIS <span className="text-rose-500">*</span></label>
                    <input type="url" name="qris_image_url" defaultValue={editingChannel?.qris_image_url} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm bg-white disabled:bg-gray-100" placeholder="https://domain.com/qris.jpg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">NMID / ID Merchant (Opsional)</label>
                    <input type="text" name="merchant_id" defaultValue={editingChannel?.merchant_id} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm bg-white disabled:bg-gray-100" placeholder="Cth: ID12345678" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Keterangan / Catatan Tambahan (Opsional)</label>
                <textarea name="description" defaultValue={editingChannel?.description} rows={4} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm disabled:bg-gray-100" placeholder="Cth: Mohon tambahkan kode unik 001 di akhir nominal transfer untuk memudahkan pengecekan..."></textarea>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status Publikasi <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    name="is_public" 
                    defaultValue={editingChannel ? String(editingChannel.is_public) : "true"} 
                    options={[{ label: "Publik (Tampil)", value: "true" }, { label: "Sembunyikan Sementara", value: "false" }]}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan Tampil (Sort Order) <span className="text-rose-500">*</span></label>
                  <input type="number" name="sort_order" defaultValue={editingChannel?.sort_order ?? 0} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm disabled:bg-gray-100" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
              <button type="button" onClick={() => setIsFormVisible(false)} disabled={isPending} className="text-gray-500 hover:bg-gray-100 text-sm font-bold py-2.5 px-6 rounded-lg transition-colors border border-transparent">
                Batal
              </button>
              <button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
                {isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> {editingChannel ? "Simpan Perubahan" : "Simpan Kanal"}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}