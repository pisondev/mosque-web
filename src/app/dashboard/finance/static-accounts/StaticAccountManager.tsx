"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { 
  createStaticPaymentMethod, 
  listStaticPaymentMethods,
  updateStaticPaymentMethod, 
  deleteStaticPaymentMethod 
} from "../../../actions/finance";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { useToast } from "../../../../components/ui/Toast";
import { useDecisionModal } from "../../../../components/ui/DecisionModalProvider";
import { CopyToClipboard, ConfirmRedirect } from "../../../../components/ui/InteractiveText";
import { Plus, Edit3, Trash2, Save, X, CreditCard, QrCode, ChevronDown, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { uploadImageFile } from "../../../../lib/upload";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const NAME_REGEX = /^[A-Za-z -]+$/;

async function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

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
  const { confirm, choose } = useDecisionModal();
  
  const [channels, setChannels] = useState<any[]>(initialChannels);
  const [editingChannel, setEditingChannel] = useState<any | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [channelType, setChannelType] = useState<"bank_account" | "qris">("bank_account");
  const [qrisPreview, setQrisPreview] = useState<string>("");
  const [pendingQrisFile, setPendingQrisFile] = useState<File | null>(null);
  const [isUploadingQris, setIsUploadingQris] = useState<boolean>(false);
  const [qrisError, setQrisError] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedChannels = useMemo(() => [...channels].sort((a,b) => a.sort_order - b.sort_order), [channels]);

  const handleMove = (channelId: number, direction: "up" | "down") => {
    const index = sortedChannels.findIndex((item) => item.id === channelId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= sortedChannels.length) return;

    const current = sortedChannels[index];
    const target = sortedChannels[targetIndex];

    const previousChannels = channels;
    const optimistic = channels.map((m) => {
      if (m.id === current.id) return { ...m, sort_order: target.sort_order };
      if (m.id === target.id) return { ...m, sort_order: current.sort_order };
      return m;
    });
    setChannels(optimistic);

    startTransition(async () => {
      const first = new FormData();
      first.append("payload", JSON.stringify({ ...current, sort_order: target.sort_order }));

      const second = new FormData();
      second.append("payload", JSON.stringify({ ...target, sort_order: current.sort_order }));

      const [res1, res2] = await Promise.all([updateStaticPaymentMethod(first), updateStaticPaymentMethod(second)]);
      if (res1.error || res2.error) {
        setChannels(previousChannels);
        addToast("Gagal menyimpan urutan.", "error");
        return;
      }
      await refreshChannels();
      addToast("Urutan diperbarui.", "success");
    });
  };

  const refreshChannels = async () => {
    const res = await listStaticPaymentMethods(1, 100);
    if (res?.status === "success" && Array.isArray(res.data)) {
      setChannels(res.data);
    }
  };

  const handleAddNewClick = () => {
    setEditingChannel(null);
    setChannelType("bank_account");
    setIsFormVisible(true);
    setQrisPreview("");
    setPendingQrisFile(null);
    setQrisError("");
    setIsDirty(false);
  };

  const handleEditClick = (channel: any) => {
    setEditingChannel(channel);
    setChannelType(channel.channel_type as "bank_account" | "qris");
    setIsFormVisible(true);
    setQrisPreview(channel.qris_image_url || "");
    setPendingQrisFile(null);
    setQrisError("");
    setIsDirty(false);
  };

  const askCloseForm = async () => {
    if (!isDirty) {
      setIsFormVisible(false);
      setEditingChannel(null);
      return;
    }
    const action = await choose({
      title: "Perubahan belum disimpan",
      description: "Tutup formulir ini dan buang perubahan yang belum disimpan, atau lanjutkan mengedit.",
      icon: "warning",
      actions: [
        { key: "discard", label: "Buang Perubahan", tone: "danger" },
        { key: "cancel", label: "Batal", tone: "neutral" },
      ],
    });
    if (action === "discard") {
      setIsFormVisible(false);
      setEditingChannel(null);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    const ok = await confirm({
      title: "Hapus metode pembayaran?",
      description: `Metode "${label}" akan dihapus dari daftar pembayaran.`,
      confirmLabel: "Hapus Metode",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteStaticPaymentMethod(id);
      if (res.error) addToast(res.error, "error");
      else {
        await refreshChannels();
        addToast("Berhasil menghapus metode pembayaran statis.", "success");
      }
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
      else {
        await refreshChannels();
        addToast(`Status ${channel.label} diperbarui!`, "success");
      }
    });
  };

  const handleQrisChange = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setQrisError("File QRIS harus berupa gambar.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setQrisError("Ukuran gambar maksimal 2MB. Jika terlalu besar, kompres gambar terlebih dahulu.");
      return;
    }
    const dataUrl = await toDataUrl(file);
    setQrisPreview(dataUrl);
    setPendingQrisFile(file);
    setQrisError("");
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() === '') continue;
      if (key === 'is_public') {
        payload[key] = value === 'true';
      } else if (key !== 'sort_order') {
        payload[key] = value;
      }
    }

    if (!payload.label || payload.label.length > 25 || !NAME_REGEX.test(payload.label)) {
      addToast("Label maksimal 25 karakter dan hanya boleh huruf, spasi, atau tanda hubung (-).", "error");
      return;
    }
    if (payload.description && String(payload.description).length > 250) {
      addToast("Catatan tambahan maksimal 250 karakter.", "error");
      return;
    }

    if (payload.channel_type === "qris") {
      if (!qrisPreview && !editingChannel?.qris_image_url) {
        addToast("Silakan unggah gambar QRIS terlebih dahulu.", "error");
        return;
      }
      delete payload.bank_name; delete payload.bank_branch; delete payload.account_number; delete payload.account_holder_name;
    } else {
      if (!payload.bank_name || !NAME_REGEX.test(payload.bank_name) || String(payload.bank_name).length > 25) {
        addToast("Nama bank maksimal 25 karakter dan hanya boleh huruf, spasi, atau tanda hubung (-).", "error");
        return;
      }
      if (!payload.account_holder_name || !NAME_REGEX.test(payload.account_holder_name) || String(payload.account_holder_name).length > 25) {
        addToast("Nama pemilik rekening maksimal 25 karakter dan hanya boleh huruf, spasi, atau tanda hubung (-).", "error");
        return;
      }
      if (!payload.account_number || !/^\d+$/.test(String(payload.account_number))) {
        addToast("Nomor rekening hanya boleh berisi angka.", "error");
        return;
      }
      delete payload.qris_image_url; delete payload.merchant_id;
    }

    if (editingChannel) {
      payload.id = editingChannel.id;
      payload.sort_order = editingChannel.sort_order;
    } else {
      payload.sort_order = (Math.max(0, ...channels.map((m) => Number(m.sort_order) || 0)) || 0) + 1;
    }

    startTransition(async () => {
      if (payload.channel_type === "qris" && pendingQrisFile) {
        setIsUploadingQris(true);
        try {
          const result = await uploadImageFile(pendingQrisFile, "qris", editingChannel?.qris_image_url || undefined);
          payload.qris_image_url = result.url;
        } catch (_) {
          setIsUploadingQris(false);
          addToast("Gagal mengunggah foto QRIS.", "error");
          return;
        }
        setIsUploadingQris(false);
      } else if (payload.channel_type === "qris" && editingChannel && qrisPreview === editingChannel.qris_image_url) {
        payload.qris_image_url = editingChannel.qris_image_url;
      }

      const submitData = new FormData();
      submitData.append("payload", JSON.stringify(payload));

      const res = editingChannel ? await updateStaticPaymentMethod(submitData) : await createStaticPaymentMethod(submitData);
      if (res.error) {
        addToast(res.error, "error");
      } else {
        await refreshChannels();
        addToast(`Berhasil ${editingChannel ? "memperbarui" : "menambah"} metode pembayaran.`, "success");
        setIsFormVisible(false);
        setEditingChannel(null);
        setIsDirty(false);
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
                <th className="px-5 py-3 font-semibold w-28 text-center uppercase tracking-wider text-[11px]">Urutan</th>
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
                sortedChannels.map((channel, index) => (
                  <tr key={channel.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-5 text-center">{channel.sort_order}</span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={index === 0 || isPending}
                            onClick={() => handleMove(channel.id, "up")}
                            className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-30"
                            title="Naikkan urutan"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sortedChannels.length - 1 || isPending}
                            onClick={() => handleMove(channel.id, "down")}
                            className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-30"
                            title="Turunkan urutan"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
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
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(channel)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 shadow-sm"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => void handleDelete(channel.id, channel.label)} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 shadow-sm disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
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
        <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl w-full max-w-5xl max-h-[92vh] overflow-visible animate-in zoom-in-95 duration-200">
          <div className="bg-emerald-900 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">{editingChannel ? "Edit Rekening/QRIS" : "Tambah Rekening Baru"}</h3>
              <p className="text-emerald-200 text-xs mt-0.5">Informasi rekening statis untuk menerima transfer manual.</p>
            </div>
            <button type="button" onClick={() => void askCloseForm()} className="text-emerald-200 hover:text-white transition-colors bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full"><X className="w-5 h-5" /></button>
          </div>

          <form key={editingChannel ? editingChannel.id : "new-channel"} onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(92vh-80px)]">
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
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-56 space-y-3 flex-shrink-0">
                    <div className="aspect-[3/4] w-full rounded-xl border-2 border-dashed border-gray-300 bg-white overflow-hidden flex items-center justify-center p-2 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      {qrisPreview ? (
                        <>
                          <img src={qrisPreview} alt="Preview QRIS" className="w-full h-full object-contain rounded-lg" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white text-xs font-bold flex items-center gap-1"><Upload className="w-4 h-4" /> Ganti Gambar</span>
                          </div>
                        </>
                      ) : (
                         <div className="text-gray-400 flex flex-col items-center">
                           <QrCode className="w-10 h-10 mb-2" />
                           <span className="text-xs font-semibold text-center">Klik untuk Unggah<br/>Barcode QRIS</span>
                         </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleQrisChange(event.target.files?.[0])} />
                    <p className={`text-[11px] text-center px-2 py-1.5 bg-white rounded-md border ${qrisError ? "text-rose-600 border-rose-100" : "text-gray-500 border-gray-200"}`}>{qrisError || "Gambar statis potrait. Maksimal 2MB."}</p>
                  </div>
                  <div className="flex-1 w-full space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-2"><QrCode className="w-4 h-4 text-emerald-600"/> NMID / ID Merchant</label>
                      <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">Opsional. Masukkan ID Merchant (NMID) jika ingin menampilkannya bersamaan dengan gambar QRIS di platform jamaah agar semakin valid.</p>
                      <input type="text" name="merchant_id" defaultValue={editingChannel?.merchant_id} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors placeholder:text-gray-400 font-mono tracking-wider" placeholder="Cth: ID123456789" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
              <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Tambahan</label><textarea name="description" defaultValue={editingChannel?.description} rows={4} disabled={isPending} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400" placeholder="Cth: Mohon tambahkan kode unik 001 di akhir..."></textarea></div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status Tampil</label>
                  <CustomSelect name="is_public" defaultValue={editingChannel ? String(editingChannel.is_public) : "true"} options={[{ label: "Publik (Tampil)", value: "true" }, { label: "Sembunyikan", value: "false" }]} disabled={isPending} />
                  <p className="text-[10px] text-gray-500 mt-2">Urutan tampil diatur langsung lewat panah geser naik/turun pada tabel daftar di luar.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-3">
              <button type="button" onClick={() => void askCloseForm()} disabled={isPending} className="text-gray-500 hover:bg-gray-100 text-sm font-bold py-2.5 px-6 rounded-lg transition-colors border border-transparent">Batal</button>
              <button type="submit" disabled={isPending || isUploadingQris} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2">
                {isUploadingQris ? "Mengunggah QRIS..." : isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> {editingChannel ? "Simpan Perubahan" : "Simpan Rekening"}</>}
              </button>
            </div>
          </form>
        </div>
        </div>
      )}
    </div>
  );
}
