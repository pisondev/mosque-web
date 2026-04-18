"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import type { AccountProfileData } from "@/app/actions/account";
import { updateAccountProfileAction } from "@/app/actions/account";
import { uploadImageFile } from "@/lib/upload";
import { useToast } from "@/components/ui/Toast";

export default function AccountProfileForm({ initialData }: { initialData: AccountProfileData }) {
  const router = useRouter();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(initialData.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || "");
  const avatarInitial = (displayName[0] || initialData.email[0] || "A").toUpperCase();

  const handleAvatarChange = async (file?: File) => {
    if (!file) return;
    try {
      const uploaded = await uploadImageFile(file, "management_photo", avatarUrl || undefined);
      setAvatarUrl(uploaded.url);
      addToast("Foto profil berhasil diunggah.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Gagal mengunggah foto profil.", "error");
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("display_name", displayName);
      formData.set("avatar_url", avatarUrl);
      const result = await updateAccountProfileAction(formData);
      if (result?.error) {
        addToast(result.error, "error");
        return;
      }
      addToast("Profil akun berhasil diperbarui.", "success");
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-6">
        <div className="relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName || initialData.email} className="h-24 w-24 rounded-full object-cover border-4 border-emerald-100 shadow-sm" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-emerald-100 shadow-sm">
              {avatarInitial}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 rounded-full bg-white border border-gray-200 p-2 shadow-sm text-emerald-700 hover:bg-emerald-50"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleAvatarChange(e.target.files?.[0])}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">Profil Akun Admin</h3>
          <p className="text-sm text-gray-500">Perbarui nama yang tampil di header dan foto profil akun admin Anda.</p>
          {initialData.google_connected && (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Google terhubung
            </div>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Tampil</label>
          <div className="relative">
            <UserRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              disabled={isPending}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Login</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={initialData.email}
              disabled
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm"
          >
            <Save className="w-4 h-4" /> {isPending ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </div>
    </div>
  );
}
