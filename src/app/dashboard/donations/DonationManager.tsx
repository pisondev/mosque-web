"use client";

import { useState, useTransition, useRef } from "react";
import { createDonationChannel, updateDonationChannel, deleteDonationChannel } from "../../actions/engagement";

export default function DonationManager({ initialChannels }: { initialChannels: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const [editingChannel, setEditingChannel] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [channelType, setChannelType] = useState<"bank_account" | "qris">("bank_account");
  
  const formRef = useRef<HTMLDivElement>(null);

  const handleAddNewClick = () => {
    setEditingChannel(null);
    setChannelType("bank_account");
    setIsFormVisible(true);
    setMessage(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleEditClick = (channel: any) => {
    setEditingChannel(channel);
    setChannelType(channel.channel_type as "bank_account" | "qris");
    setIsFormVisible(true);
    setMessage(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleDelete = (id: number, label: string) => {
    if (!window.confirm(`Yakin ingin menghapus kanal donasi "${label}"?`)) return;
    startTransition(async () => {
      setMessage(null);
      const res = await deleteDonationChannel(id);
      if (res.error) setMessage({ text: res.error, type: "error" });
      else setMessage({ text: "Berhasil menghapus kanal donasi.", type: "success" });
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

    // Bersihkan field yang tidak relevan berdasarkan channel type
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
      setMessage(null);
      const res = editingChannel ? await updateDonationChannel(submitData) : await createDonationChannel(submitData);
      
      if (res.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setMessage({ text: `Berhasil ${editingChannel ? "memperbarui" : "menambah"} kanal donasi.`, type: "success" });
        setIsFormVisible(false);
        setEditingChannel(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* BAGIAN TABEL */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Daftar Kanal Terdaftar</h3>
          <button onClick={handleAddNewClick} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Tambah Kanal Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-white text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 font-medium">Label / Tujuan</th>
                <th className="px-5 py-3 font-medium">Tipe Pembayaran</th>
                <th className="px-5 py-3 font-medium">Detail Akun</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialChannels.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-gray-500 text-center bg-gray-50/50">Belum ada kanal donasi.</td></tr>
              ) : (
                initialChannels.sort((a,b) => a.sort_order - b.sort_order).map((channel) => (
                  <tr key={channel.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{channel.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{channel.description || "-"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${channel.channel_type === 'qris' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {channel.channel_type === 'qris' ? 'QRIS' : 'Transfer Bank'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {channel.channel_type === 'bank_account' ? (
                        <>
                          <p className="font-medium text-gray-900">{channel.bank_name} - {channel.account_number}</p>
                          <p className="text-xs text-gray-600 mt-0.5">a.n. {channel.account_holder_name}</p>
                        </>
                      ) : (
                        <a href={channel.qris_image_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline flex items-center gap-1">
                          Lihat QRIS ↗
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${channel.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {channel.is_public ? "Publik" : "Disembunyikan"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(channel)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium border border-blue-200">Edit</button>
                        <button onClick={() => handleDelete(channel.id, channel.label)} disabled={isPending} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium border border-red-200 disabled:opacity-50">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {message && !isFormVisible && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* BAGIAN FORM ENTRY */}
      {isFormVisible && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden scroll-mt-6 animate-in fade-in slide-in-from-bottom-4" ref={formRef}>
          <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">{editingChannel ? "Edit Kanal Donasi" : "Tambah Kanal Donasi Baru"}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{editingChannel ? `ID: #${editingChannel.id}` : "Lengkapi informasi rekening atau QRIS."}</p>
            </div>
            <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form key={editingChannel ? editingChannel.id : "new-channel"} onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Label / Peruntukan <span className="text-red-500">*</span></label>
                <input type="text" name="label" defaultValue={editingChannel?.label} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Infaq Operasional Masjid" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipe Pembayaran <span className="text-red-500">*</span></label>
                <select 
                  name="channel_type" 
                  value={channelType} 
                  onChange={(e) => setChannelType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="bank_account">Transfer Bank Rekening</option>
                  <option value="qris">Scan Barcode QRIS</option>
                </select>
              </div>
            </div>

            {/* DYNAMIC FIELDS BERDASARKAN TIPE PEMBAYARAN */}
            <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/50 space-y-4">
              {channelType === "bank_account" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Bank <span className="text-red-500">*</span></label>
                    <input type="text" name="bank_name" defaultValue={editingChannel?.bank_name} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: BSI / Mandiri / BCA" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kantor Cabang (Opsional)</label>
                    <input type="text" name="bank_branch" defaultValue={editingChannel?.bank_branch} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: KCP Sudirman" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor Rekening <span className="text-red-500">*</span></label>
                    <input type="text" name="account_number" defaultValue={editingChannel?.account_number} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: 1234567890" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Atas Nama (A.N) <span className="text-red-500">*</span></label>
                    <input type="text" name="account_holder_name" defaultValue={editingChannel?.account_holder_name} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Masjid Jami Al-Ikhlas" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Gambar Barcode QRIS <span className="text-red-500">*</span></label>
                    <input type="url" name="qris_image_url" defaultValue={editingChannel?.qris_image_url} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://domain.com/qris.jpg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">NMID / ID Merchant (Opsional)</label>
                    <input type="text" name="merchant_id" defaultValue={editingChannel?.merchant_id} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: ID12345678" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-100 pt-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Keterangan / Catatan Tambahan (Opsional)</label>
                <textarea name="description" defaultValue={editingChannel?.description} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Mohon tambahkan kode unik 001 di akhir nominal..."></textarea>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutan Tampil <span className="text-red-500">*</span></label>
                  <input type="number" name="sort_order" defaultValue={editingChannel?.sort_order ?? 0} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status Publikasi <span className="text-red-500">*</span></label>
                  <select name="is_public" defaultValue={editingChannel ? String(editingChannel.is_public) : "true"} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="true">Publik (Bisa Dilihat Jamaah)</option>
                    <option value="false">Sembunyikan Sementara</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 gap-3">
              <button type="button" onClick={() => setIsFormVisible(false)} className="text-gray-500 hover:bg-gray-100 text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors">Batal</button>
              <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95">
                {isPending ? "Menyimpan..." : (editingChannel ? "Simpan Perubahan" : "Simpan Kanal")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}