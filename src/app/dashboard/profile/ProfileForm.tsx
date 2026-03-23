"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertProfileAction } from "../../actions/profile";
import CustomSelect from "../../../components/ui/CustomSelect";
import { CopyToClipboard, ConfirmRedirect } from "../../../components/ui/InteractiveText";
import { useToast } from "../../../components/ui/Toast";
import { MapPin, Phone, Mail, Globe, Edit3, X, Save } from "lucide-react";

type ProfileInitialData = {
  official_name: string; kind: string; short_name: string; city: string;
  address_full: string; phone_whatsapp: string; email: string; subdomain: string;
};

export default function ProfileForm({ initialData }: { initialData: ProfileInitialData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { addToast } = useToast();

  const kindOptions = [
    { label: "Masjid", value: "masjid" }, { label: "Musala", value: "musala" },
    { label: "Surau", value: "surau" }, { label: "Langgar", value: "langgar" },
  ];

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await upsertProfileAction(formData);
      if (res?.error) {
        addToast(res.error, "error");
        return;
      }
      addToast("Profil berhasil diperbarui!", "success");
      setIsEditing(false);
      router.refresh();
    });
  };

  const currentKindLabel = kindOptions.find(o => o.value === initialData.kind)?.label || initialData.kind;

  return (
    <div>
      {/* Header Panel Tunggal */}
      <div className="flex justify-between items-center px-6 md:px-8 py-5 border-b border-gray-100 bg-white">
        <h3 className="font-bold tracking-widest text-gray-800 uppercase text-sm">
          Identitas Utama
        </h3>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors border border-emerald-200 shadow-sm">
            <Edit3 className="w-4 h-4" /> Edit Profil
          </button>
        )}
      </div>

      {!isEditing ? (
        /* --- MODE VIEW (READ-ONLY) --- */
        <div className="animate-in fade-in">
          
          {/* Identitas Utama Data */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Nama Resmi</p>
              <div className="pl-3 border-l-2 border-emerald-300">
                <p className="text-lg font-bold text-gray-900">{initialData.official_name || "-"}</p>
                <p className="text-sm font-medium text-emerald-700 mt-0.5">{currentKindLabel}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Nama Singkat</p>
              <div className="pl-3 border-l-2 border-emerald-300">
                <p className="text-lg font-bold text-gray-900">{initialData.short_name || "-"}</p>
              </div>
            </div>
          </div>

          {/* Kontak & Lokasi (Background Abu-abu) */}
          <div className="bg-gray-50/80 border-t border-gray-100 p-6 md:p-8">
            <h3 className="font-bold tracking-widest text-gray-800 uppercase text-sm mb-6">
              Kontak & Lokasi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Kiri: Lokasi */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Kota / Kabupaten</p>
                  <div className="pl-3 border-l-2 border-gray-300">
                    <p className="text-sm font-medium text-gray-900">{initialData.city || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Alamat Lengkap</p>
                  <div className="pl-3 border-l-2 border-gray-300">
                    <p className="text-sm font-medium text-gray-900 leading-relaxed max-w-sm">
                      {initialData.address_full || "-"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Kanan: Info Kontak */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> WhatsApp Takmir</p>
                  <div className="pl-3 border-l-2 border-emerald-300">
                    {initialData.phone_whatsapp ? <CopyToClipboard text={initialData.phone_whatsapp} /> : <span className="text-sm text-gray-900">-</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Email Publik</p>
                  <div className="pl-3 border-l-2 border-emerald-300">
                    {initialData.email ? <CopyToClipboard text={initialData.email} /> : <span className="text-sm text-gray-900">-</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5"><Globe className="w-3.5 h-3.5"/> Subdomain Portal Jamaah</p>
                  <div className="pl-3 border-l-2 border-emerald-300">
                    {initialData.subdomain ? (
                      <ConfirmRedirect url={`https://${initialData.subdomain}.mosquesaas.com`} display={`${initialData.subdomain}.mosquesaas.com`} />
                    ) : <span className="text-sm text-gray-900">-</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- MODE EDIT (FORM) --- */
        <form action={handleSubmit} className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Resmi <span className="text-red-500">*</span></label>
              <input type="text" name="official_name" defaultValue={initialData.official_name} required disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis Tempat <span className="text-red-500">*</span></label>
              <CustomSelect name="kind" options={kindOptions} defaultValue={initialData.kind} disabled={isPending} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Singkat</label>
              <input type="text" name="short_name" defaultValue={initialData.short_name} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm" />
            </div>
          </div>
          
          <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-8 border-t border-b border-gray-100">
             <h3 className="font-bold tracking-widest text-gray-800 uppercase text-sm mb-6">Kontak & Lokasi</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kota / Kabupaten</label>
                    <input type="text" name="city" defaultValue={initialData.city} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Alamat Lengkap</label>
                    <textarea name="address_full" defaultValue={initialData.address_full} rows={4} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm" />
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">WhatsApp Takmir</label>
                    <input type="text" name="phone_whatsapp" defaultValue={initialData.phone_whatsapp} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Publik</label>
                    <input type="email" name="email" defaultValue={initialData.email} disabled={isPending} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subdomain Portal Jamaah</label>
                    <input type="text" value={initialData.subdomain ? `${initialData.subdomain}.mosquesaas.com` : "Belum diatur"} disabled className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed font-mono text-sm" />
                  </div>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsEditing(false)} disabled={isPending} className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 font-semibold py-2.5 px-5 rounded-lg transition-colors">
              <X className="w-4 h-4" /> Batal
            </button>
            <button type="submit" disabled={isPending} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
              {isPending ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}