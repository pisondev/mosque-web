"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManagementMember, updateManagementMember, deleteManagementMember, listManagementMembers } from "../../actions/community";
import CustomSelect from "../../../components/ui/CustomSelect";
import { CopyToClipboard } from "../../../components/ui/InteractiveText";
import { useToast } from "../../../components/ui/Toast";
import { useDecisionModal } from "../../../components/ui/DecisionModalProvider";
import { Plus, Edit3, Trash2, Save, X, ChevronDown, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { uploadImageFile } from "../../../lib/upload";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const PLACEHOLDER_IMAGE = "/placeholder-user.svg";
const NAME_MAX = 25;
const NAME_REGEX = /^[A-Za-z -]+$/;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function sanitizeNameLike(value: string) {
  return value.replace(/[^A-Za-z -]/g, "").slice(0, NAME_MAX);
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

async function fileToPreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

type ManagementMember = {
  id: number;
  full_name: string;
  role_title: string;
  phone_whatsapp?: string;
  profile_image_url?: string;
  show_public: boolean;
  sort_order: number;
};

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
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ml-3 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
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

export default function ManagementManager({ initialMembers }: { initialMembers: ManagementMember[] }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const { choose, confirm } = useDecisionModal();
  const router = useRouter();

  const [members, setMembers] = useState<ManagementMember[]>(initialMembers || []);
  const [editingMember, setEditingMember] = useState<ManagementMember | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const formElementRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.sort_order - b.sort_order),
    [members]
  );

  const resetFormState = () => {
    setValidationErrors({});
    setPhotoPreview("");
    setPendingPhotoFile(null);
    setPhotoError("");
    setIsDirty(false);
  };

  const refreshMembers = async () => {
    const res = await listManagementMembers(1, 100);
    if (res?.status === "success" && Array.isArray(res.data)) {
      setMembers(res.data);
      return res.data;
    }
    return null;
  };

  const openForm = (member: ManagementMember | null) => {
    setEditingMember(member);
    setIsFormVisible(true);
    resetFormState();
    setPhotoPreview(member?.profile_image_url || "");
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setEditingMember(null);
    resetFormState();
  };

  const askCloseForm = async () => {
    if (!isDirty || isPending) {
      closeForm();
      return;
    }
    const action = await choose({
      title: "Perubahan belum disimpan",
      description: "Simpan perubahan terlebih dahulu, buang perubahan, atau lanjutkan mengedit.",
      icon: "warning",
      actions: [
        { key: "save", label: "Simpan Perubahan", tone: "primary" },
        { key: "discard", label: "Buang Perubahan", tone: "danger" },
        { key: "cancel", label: "Batal", tone: "neutral" },
      ],
    });

    if (action === "save") {
      formElementRef.current?.requestSubmit();
      return;
    }
    if (action === "discard") {
      closeForm();
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const ok = await confirm({
      title: "Hapus pengurus?",
      description: `Data pengurus "${name}" akan dihapus dari susunan organisasi.`,
      confirmLabel: "Hapus Pengurus",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteManagementMember(id);
      if (res.error) {
        addToast(res.error, "error");
        return;
      }
      await refreshMembers();
      addToast(`Pengurus ${name} berhasil dihapus.`, "success");
      router.refresh();
    });
  };

  const handleQuickStatusChange = (member: ManagementMember, newStatusStr: string) => {
    const isPublic = newStatusStr === "true";
    startTransition(async () => {
      const payload = { ...member, show_public: isPublic };
      const submitData = new FormData();
      submitData.append("payload", JSON.stringify(payload));

      const res = await updateManagementMember(submitData);
      if (res.error) {
        addToast("Gagal memperbarui status", "error");
        return;
      }
      await refreshMembers();
      addToast(`Status ${member.full_name} diperbarui!`, "success");
      router.refresh();
    });
  };

  const handleMove = (memberId: number, direction: "up" | "down") => {
    const index = sortedMembers.findIndex((item) => item.id === memberId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= sortedMembers.length) return;

    const current = sortedMembers[index];
    const target = sortedMembers[targetIndex];

    const previousMembers = members;
    const optimistic = members.map((m) => {
      if (m.id === current.id) return { ...m, sort_order: target.sort_order };
      if (m.id === target.id) return { ...m, sort_order: current.sort_order };
      return m;
    });
    setMembers(optimistic);

    startTransition(async () => {
      const first = new FormData();
      first.append("payload", JSON.stringify({ ...current, sort_order: target.sort_order }));

      const second = new FormData();
      second.append("payload", JSON.stringify({ ...target, sort_order: current.sort_order }));

      const [res1, res2] = await Promise.all([updateManagementMember(first), updateManagementMember(second)]);
      if (res1.error || res2.error) {
        setMembers(previousMembers);
        addToast("Gagal menyimpan urutan pengurus.", "error");
        return;
      }

      await refreshMembers();
      addToast("Urutan pengurus diperbarui.", "success");
      router.refresh();
    });
  };

  const handlePhotoChange = async (file?: File) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("File harus berupa gambar (JPG/PNG/WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setPhotoError("Ukuran gambar maksimal 2MB. Kompres gambar lalu coba lagi.");
      return;
    }

    try {
      const preview = await fileToPreview(file);
      setPhotoPreview(preview);
      setPendingPhotoFile(file);
      setPhotoError("");
      setIsDirty(true);
    } catch {
      setPhotoError("Gagal membaca gambar. Coba file lain.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, FormDataEntryValue | number | boolean> = {};
    const errors: Record<string, string> = {};

    let hasError = false;
    const fullName = String(formData.get("full_name") || "").trim();
    const roleTitle = String(formData.get("role_title") || "").trim();

    if (!fullName) {
      errors.full_name = "Nama lengkap harus diisi.";
      hasError = true;
    } else if (fullName.length > NAME_MAX) {
      errors.full_name = `Maksimal ${NAME_MAX} karakter.`;
      hasError = true;
    } else if (!NAME_REGEX.test(fullName)) {
      errors.full_name = "Gunakan huruf, spasi, atau tanda hubung (-).";
      hasError = true;
    }
    if (!roleTitle) {
      errors.role_title = "Jabatan atau peran harus diisi.";
      hasError = true;
    } else if (roleTitle.length > NAME_MAX) {
      errors.role_title = `Maksimal ${NAME_MAX} karakter.`;
      hasError = true;
    } else if (!NAME_REGEX.test(roleTitle)) {
      errors.role_title = "Gunakan huruf, spasi, atau tanda hubung (-).";
      hasError = true;
    }

    const phone = String(formData.get("phone_whatsapp") || "").trim();
    if (phone && !/^\d+$/.test(phone)) {
      errors.phone_whatsapp = "Nomor WhatsApp hanya boleh berisi angka.";
      hasError = true;
    }

    if (hasError) {
      setValidationErrors(errors);
      addToast("Mohon lengkapi kolom yang wajib diisi.", "error");
      return;
    }

    setValidationErrors({});
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim() === "") continue;
      if (key === "show_public") payload[key] = value === "true";
      else payload[key] = value;
    }

    if (pendingPhotoFile) {
      setIsUploadingPhoto(true);
      try {
        const result = await uploadImageFile(
          pendingPhotoFile,
          "management_photo",
          editingMember?.profile_image_url || undefined
        );
        payload.profile_image_url = result.url;
      } catch (error) {
        setIsUploadingPhoto(false);
        addToast(error instanceof Error ? error.message : "Gagal mengunggah foto profil.", "error");
        return;
      }
      setIsUploadingPhoto(false);
    }
    if (editingMember) {
      payload.id = editingMember.id;
      payload.sort_order = editingMember.sort_order;
    } else {
      payload.sort_order = (Math.max(0, ...members.map((m) => Number(m.sort_order) || 0)) || 0) + 1;
    }

    const submitData = new FormData();
    submitData.append("payload", JSON.stringify(payload));

    startTransition(async () => {
      const res = editingMember
        ? await updateManagementMember(submitData)
        : await createManagementMember(submitData);

      if (res.error) {
        addToast(res.error, "error");
        return;
      }

      await refreshMembers();
      addToast(`Berhasil ${editingMember ? "memperbarui" : "menambah"} data pengurus.`, "success");
      closeForm();
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Daftar Pengurus</h3>
            <p className="text-xs text-gray-500 mt-0.5">Atur visibilitas publik dan urutan tampil langsung dari daftar.</p>
          </div>
          <button onClick={() => openForm(null)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95">
            <Plus className="w-4 h-4" />
            Tambah Pengurus
          </button>
        </div>

        <div className="overflow-x-auto pb-32">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold w-28 text-center uppercase tracking-wider text-[11px]">Urutan</th>
                <th className="px-5 py-3 font-semibold w-24 text-center uppercase tracking-wider text-[11px]">Foto</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Nama & Jabatan</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Kontak (WA)</th>
                <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px]">Status Publikasi</th>
                <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedMembers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-gray-400 text-center bg-gray-50/30 font-medium">Belum ada pengurus terdaftar.</td></tr>
              ) : (
                sortedMembers.map((member, index) => (
                  <tr key={member.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-5 text-center">{member.sort_order}</span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={index === 0 || isPending}
                            onClick={() => handleMove(member.id, "up")}
                            className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-30"
                            title="Naikkan urutan"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sortedMembers.length - 1 || isPending}
                            onClick={() => handleMove(member.id, "down")}
                            className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-30"
                            title="Turunkan urutan"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center">
                        <img
                          src={member.profile_image_url || PLACEHOLDER_IMAGE}
                          alt={`Foto ${member.full_name}`}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-50"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{member.full_name}</p>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">{member.role_title}</p>
                    </td>
                    <td className="px-5 py-4">
                      {member.phone_whatsapp ? (
                        <CopyToClipboard text={member.phone_whatsapp} display={member.phone_whatsapp} />
                      ) : (
                        <span className="text-gray-400 text-xs italic">- Kosong -</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <InlineStatusSelect
                         value={String(member.show_public)}
                         onChange={(val) => handleQuickStatusChange(member, val)}
                         disabled={isPending}
                      />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openForm(member)} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => void handleDelete(member.id, member.full_name)} disabled={isPending} className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormVisible && (
        <div className="fixed inset-0 z-[140] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden w-full max-w-4xl max-h-[92vh] animate-in zoom-in-95 duration-200">
          <div className="bg-white px-6 md:px-8 py-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{editingMember ? "Edit Profil Pengurus" : "Tambah Pengurus Baru"}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{editingMember ? `Menyunting data ID #${editingMember.id}` : "Lengkapi formulir di bawah ini."}</p>
            </div>
            <button type="button" onClick={() => void askCloseForm()} className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full border border-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            key={editingMember ? editingMember.id : "new-member"}
            ref={formElementRef}
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
            onChange={() => setIsDirty(true)}
            className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(92vh-84px)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Foto Profil</p>
                <div className="aspect-square rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-inner">
                  <img
                    src={photoPreview || editingMember?.profile_image_url || PLACEHOLDER_IMAGE}
                    alt="Pratinjau Foto Profil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void handlePhotoChange(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  <Upload className="w-4 h-4" /> Ganti Foto Profil
                </button>
                {photoError ? (
                  <p className="text-[11px] text-rose-600 font-medium">{photoError}</p>
                ) : (
                  <p className="text-[11px] text-gray-500">Maksimal 2MB. Jika terlalu besar, kompres gambar terlebih dahulu.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5">Data Profil</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap <span className="text-rose-500">*</span></label>
                    <input type="text" name="full_name" maxLength={NAME_MAX} defaultValue={editingMember?.full_name} onInput={(e) => { e.currentTarget.value = sanitizeNameLike(e.currentTarget.value); }} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 focus:ring-2 outline-none transition-colors ${validationErrors.full_name ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"}`} placeholder="Contoh: Ahmad Fauzi" />
                    <p className={`text-[11px] mt-1.5 ${validationErrors.full_name ? "text-rose-600" : "text-gray-500"}`}>Maksimal {NAME_MAX} karakter.</p>
                    {validationErrors.full_name && <p className="text-rose-500 text-[10px] mt-1.5 font-medium animate-in fade-in">{validationErrors.full_name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jabatan / Peran <span className="text-rose-500">*</span></label>
                    <input type="text" name="role_title" maxLength={NAME_MAX} defaultValue={editingMember?.role_title} onInput={(e) => { e.currentTarget.value = sanitizeNameLike(e.currentTarget.value); }} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 focus:ring-2 outline-none transition-colors ${validationErrors.role_title ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"}`} placeholder="Contoh: Ketua Takmir" />
                    <p className={`text-[11px] mt-1.5 ${validationErrors.role_title ? "text-rose-600" : "text-gray-500"}`}>Maksimal {NAME_MAX} karakter.</p>
                    {validationErrors.role_title && <p className="text-rose-500 text-[10px] mt-1.5 font-medium animate-in fade-in">{validationErrors.role_title}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp (Opsional)</label>
                    <input type="text" inputMode="numeric" name="phone_whatsapp" defaultValue={editingMember?.phone_whatsapp} onInput={(e) => { e.currentTarget.value = sanitizeDigits(e.currentTarget.value); }} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 outline-none ${validationErrors.phone_whatsapp ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500"}`} placeholder="Contoh: 081234567890" />
                    <p className={`text-[11px] mt-1.5 ${validationErrors.phone_whatsapp ? "text-rose-600" : "text-gray-500"}`}>Hanya angka.</p>
                    {validationErrors.phone_whatsapp && <p className="text-rose-500 text-[10px] mt-1.5 font-medium animate-in fade-in">{validationErrors.phone_whatsapp}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-8 border-t border-b border-gray-100">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5">Pengaturan Publikasi</p>
              <div className="max-w-md">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Visibilitas Publik <span className="text-rose-500">*</span></label>
                <CustomSelect
                  name="show_public"
                  defaultValue={editingMember ? String(editingMember.show_public) : "true"}
                  options={[
                    { label: "Tampilkan di Website Jamaah", value: "true" },
                    { label: "Sembunyikan (Hanya Internal)", value: "false" }
                  ]}
                />
                <p className="text-[10px] text-gray-500 mt-2">Urutan tampil diatur lewat tombol naik/turun pada daftar pengurus.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => void askCloseForm()} className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 font-semibold py-2.5 px-5 rounded-lg transition-colors border border-transparent">
                Batal
              </button>
              <button type="submit" disabled={isPending} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm active:scale-95">
                {isUploadingPhoto ? "Mengunggah foto..." : isPending ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan Pengurus</>}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
}
