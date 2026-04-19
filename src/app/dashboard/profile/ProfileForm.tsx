"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upsertProfileAction } from "../../actions/profile";
import { CopyToClipboard, ConfirmRedirect } from "../../../components/ui/InteractiveText";
import { useToast } from "../../../components/ui/Toast";
import { useDecisionModal } from "../../../components/ui/DecisionModalProvider";
import CustomSelect from "@/components/ui/CustomSelect";
import { getPublicPortalDisplay, getPublicPortalUrl } from "@/lib/public-portal";
import { MapPin, Phone, Mail, Globe, Edit3, X, Save, Camera, Building2 } from "lucide-react";
import { uploadImageFile } from "../../../lib/upload";

type ProfileInitialData = {
  official_name: string;
  kind: string;
  short_name: string;
  province: string;
  city: string;
  address_full: string;
  phone_whatsapp: string;
  email: string;
  subdomain: string;
  header_image_url: string;
};

type ProfileFormData = {
  official_name: string;
  kind: string;
  short_name: string;
  province: string;
  city: string;
  address_full: string;
  phone_whatsapp: string;
  email: string;
  header_image_url: string;
};

const NAME_REGEX = /^[A-Za-z -]+$/;
const NAME_MAX = 25;
const TEXTAREA_MAX = 250;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const KIND_OPTIONS = [
  { label: "Masjid", value: "masjid" },
  { label: "Musala", value: "musala" },
  { label: "Surau", value: "surau" },
  { label: "Langgar", value: "langgar" },
];

function sanitizePhone(value: string) {
  return value.replace(/\D/g, "");
}

async function fileToPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Gagal membaca gambar."));
    reader.readAsDataURL(file);
  });
}

function initialToState(data: ProfileInitialData): ProfileFormData {
  return {
    official_name: data.official_name || "",
    kind: data.kind || "masjid",
    short_name: data.short_name || "",
    province: data.province || "",
    city: data.city || "",
    address_full: data.address_full || "",
    phone_whatsapp: data.phone_whatsapp || "",
    email: data.email || "",
    header_image_url: data.header_image_url || "",
  };
}

export default function ProfileForm({ initialData }: { initialData: ProfileInitialData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialToState(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [isProvLoading, setIsProvLoading] = useState(false);
  // preview = local data-url shown before upload; pendingFile = file awaiting upload on save
  const [headerPreview, setHeaderPreview] = useState<string>(initialData.header_image_url || "");
  const [pendingHeaderFile, setPendingHeaderFile] = useState<File | null>(null);
  const [headerError, setHeaderError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { addToast } = useToast();
  const { choose } = useDecisionModal();

  const currentKindLabel = KIND_OPTIONS.find((o) => o.value === initialData.kind)?.label || initialData.kind;
  const provinceOptions = useMemo(
    () => [
      { label: isProvLoading ? "Memuat data provinsi..." : "-- Pilih Provinsi --", value: "" },
      ...provinces.map((province) => ({ label: province, value: province })),
    ],
    [isProvLoading, provinces],
  );
  const cityOptions = useMemo(() => {
    const placeholder = !formData.province
      ? "-- Pilih provinsi dulu --"
      : isCityLoading
        ? "Memuat kabupaten/kota..."
        : "-- Pilih Kabupaten/Kota --";

    return [
      { label: placeholder, value: "" },
      ...cities.map((city) => ({ label: city, value: city })),
    ];
  }, [cities, formData.province, isCityLoading]);

  // Load provinsi saat masuk mode edit
  useEffect(() => {
    if (!isEditing || provinces.length > 0) return;
    setIsProvLoading(true);
    fetch("/api/wilayah/provinsi")
      .then((r) => r.json())
      .then((json) => {
        setProvinces(Array.isArray(json.data) ? json.data : []);
      })
      .catch(() => setProvinces([]))
      .finally(() => setIsProvLoading(false));
  }, [isEditing, provinces.length]);

  // Load kota ketika provinsi berubah
  const loadCities = useCallback(async (prov: string) => {
    if (!prov) {
      setCities([]);
      return;
    }
    setIsCityLoading(true);
    try {
      const res = await fetch("/api/wilayah/kabkota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provinsi: prov }),
      });
      const json = await res.json();
      setCities(Array.isArray(json.data) ? json.data : []);
    } catch {
      setCities([]);
    } finally {
      setIsCityLoading(false);
    }
  }, []);

  // Saat edit dibuka, pre-load kota jika sudah ada provinsi
  useEffect(() => {
    if (isEditing && formData.province) {
      void loadCities(formData.province);
    }
    // Intentionally only when edit mode opens to avoid refetch loop while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]); // hanya saat edit dibuka

  const isDirty = useMemo(() => {
    const initial = initialToState(initialData);
    return JSON.stringify(initial) !== JSON.stringify(formData) || pendingHeaderFile !== null;
  }, [formData, initialData, pendingHeaderFile]);

  const setField = (key: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleProvinceChange = (prov: string) => {
    setField("province", prov);
    setField("city", "");
    void loadCities(prov);
  };

  const handleHeaderChange = async (file?: File) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setHeaderError("Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setHeaderError("Ukuran gambar maksimal 2MB. Kompres gambar terlebih dahulu jika terlalu besar.");
      return;
    }
    // Show local preview immediately; actual upload happens on save
    const preview = await fileToPreviewUrl(file);
    setHeaderPreview(preview);
    setPendingHeaderFile(file);
    setHeaderError("");
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const officialName = formData.official_name.trim();
    const shortName = formData.short_name.trim();

    if (!officialName) {
      nextErrors.official_name = "Nama resmi wajib diisi.";
    } else if (officialName.length > NAME_MAX) {
      nextErrors.official_name = `Maksimal ${NAME_MAX} karakter.`;
    } else if (!NAME_REGEX.test(officialName)) {
      nextErrors.official_name = "Gunakan huruf, spasi, atau tanda hubung (-).";
    }

    if (shortName) {
      if (shortName.length > NAME_MAX) {
        nextErrors.short_name = `Maksimal ${NAME_MAX} karakter.`;
      } else if (!NAME_REGEX.test(shortName)) {
        nextErrors.short_name = "Gunakan huruf, spasi, atau tanda hubung (-).";
      }
    }

    if (formData.address_full.length > TEXTAREA_MAX) {
      nextErrors.address_full = `Maksimal ${TEXTAREA_MAX} karakter.`;
    }

    if (formData.phone_whatsapp && !/^\d+$/.test(formData.phone_whatsapp)) {
      nextErrors.phone_whatsapp = "Nomor WhatsApp hanya boleh berisi angka.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitForm = async () => {
    if (!validate()) {
      addToast("Periksa kembali data profil yang belum valid.", "error");
      return;
    }

    setIsPending(true);

    // 1. Upload gambar ke S3 jika ada file baru
    let finalImageUrl = formData.header_image_url;
    if (pendingHeaderFile) {
      setIsUploading(true);
      try {
        const result = await uploadImageFile(
          pendingHeaderFile,
          "header",
          initialData.header_image_url || undefined
        );
        finalImageUrl = result.url;
        setPendingHeaderFile(null);
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Gagal mengunggah foto header.", "error");
        setIsPending(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const submitData = new FormData();
    submitData.set("official_name", formData.official_name.trim());
    submitData.set("kind", formData.kind);
    submitData.set("short_name", formData.short_name.trim());
    submitData.set("province", formData.province.trim());
    submitData.set("city", formData.city.trim());
    submitData.set("address_full", formData.address_full.trim());
    submitData.set("phone_whatsapp", formData.phone_whatsapp.trim());
    submitData.set("email", formData.email.trim());
    submitData.set("header_image_url", finalImageUrl);

    const res = await upsertProfileAction(submitData);
    setIsPending(false);

    if (res?.error) {
      addToast(res.error, "error");
      return;
    }

    addToast("Profil berhasil diperbarui!", "success");
    setIsEditing(false);
    router.refresh();
  };

  const resetForm = () => {
    setFormData(initialToState(initialData));
    setHeaderPreview(initialData.header_image_url || "");
    setPendingHeaderFile(null);
    setErrors({});
    setHeaderError("");
  };

  const handleCloseEdit = async () => {
    if (!isDirty || isPending) {
      setIsEditing(false);
      resetForm();
      return;
    }

    const action = await choose({
      title: "Perubahan belum disimpan",
      description: "Simpan perubahan profil, buang perubahan, atau lanjutkan mengedit.",
      icon: "warning",
      actions: [
        { key: "save", label: "Simpan Perubahan", tone: "primary" },
        { key: "discard", label: "Buang Perubahan", tone: "danger" },
        { key: "cancel", label: "Batal", tone: "neutral" },
      ],
    });

    if (action === "save") {
      await submitForm();
      return;
    }

    if (action === "discard") {
      setIsEditing(false);
      resetForm();
    }
  };

  return (
    <div>
      {/* ─── Tombol Edit ─── */}
      <div className="flex justify-between items-center px-6 md:px-8 py-5 border-b border-gray-100 bg-white">
        <h3 className="font-bold tracking-widest text-gray-800 uppercase text-sm">Identitas Utama</h3>
        {!isEditing && (
          <button
            onClick={() => {
              resetForm();
              setIsEditing(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors border border-emerald-200 shadow-sm"
          >
            <Edit3 className="w-4 h-4" /> Edit Profil
          </button>
        )}
      </div>

      {!isEditing ? (
        /* ─── VIEW MODE ─── */
        <div className="animate-in fade-in">
          {/* Header Image */}
          <div className="relative w-full aspect-[4/3] max-h-64 bg-gray-100 overflow-hidden border-b border-gray-100">
            {initialData.header_image_url ? (
              <img
                src={initialData.header_image_url}
                alt="Foto Header Masjid"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                <Building2 className="w-12 h-12" />
                <span className="text-xs font-medium">Belum ada foto header</span>
              </div>
            )}
          </div>

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

          <div className="bg-gray-50/80 border-t border-gray-100 p-6 md:p-8">
            <h3 className="font-bold tracking-widest text-gray-800 uppercase text-sm mb-6">Kontak & Lokasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Provinsi
                  </p>
                  <div className="pl-3 border-l-2 border-gray-300">
                    <p className="text-sm font-medium text-gray-900">{initialData.province || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Kabupaten / Kota
                  </p>
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

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> WhatsApp Takmir
                  </p>
                  <div className="pl-3 border-l-2 border-emerald-300">
                    {initialData.phone_whatsapp
                      ? <CopyToClipboard text={initialData.phone_whatsapp} />
                      : <span className="text-sm text-gray-900">-</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Publik
                  </p>
                  <div className="pl-3 border-l-2 border-emerald-300">
                    {initialData.email
                      ? <CopyToClipboard text={initialData.email} />
                      : <span className="text-sm text-gray-900">-</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Subdomain Portal Jamaah
                  </p>
                  <div className="pl-3 border-l-2 border-emerald-300">
                    {initialData.subdomain ? (
                      <ConfirmRedirect
                        url={getPublicPortalUrl(initialData.subdomain)}
                        display={getPublicPortalDisplay(initialData.subdomain)}
                      />
                    ) : (
                      <span className="text-sm text-gray-900">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── EDIT MODE ─── */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitForm();
          }}
          className="animate-in fade-in slide-in-from-bottom-2 bg-white"
        >
          {/* ─── Foto Header ─── */}
          <div className="relative w-full aspect-[4/3] max-h-64 bg-gray-100 overflow-hidden border-b border-gray-100 group">
            {headerPreview ? (
              <img src={headerPreview} alt="Preview Foto Header" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                <Building2 className="w-12 h-12" />
                <span className="text-xs font-medium">Belum ada foto header</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => headerInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-800 text-sm font-semibold shadow-md"
              >
                <Camera className="w-4 h-4" /> Ganti Foto Header
              </button>
            </div>
            <input
              ref={headerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleHeaderChange(e.target.files?.[0])}
            />
          </div>
          {headerError && (
            <p className="text-xs text-rose-600 px-6 pt-2">{headerError}</p>
          )}
          <p className="text-[11px] text-gray-400 px-6 pt-1 pb-0">Gambar landscape 4:3. Maksimal 2MB. Kompres jika terlalu besar.</p>

          {/* ─── Identitas Utama ─── */}
          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Resmi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="official_name"
                  value={formData.official_name}
                  maxLength={NAME_MAX}
                  onChange={(e) => setField("official_name", e.target.value.replace(/[^A-Za-z -]/g, ""))}
                  disabled={isPending}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm ${errors.official_name ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500"}`}
                />
                <p className={`text-[11px] mt-1.5 ${errors.official_name ? "text-rose-600" : "text-gray-500"}`}>
                  {errors.official_name || `Maksimal ${NAME_MAX} karakter.`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Jenis Tempat <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  key={`kind-${formData.kind}`}
                  name="kind_display"
                  options={KIND_OPTIONS}
                  defaultValue={formData.kind}
                  onChange={(val) => setField("kind", val)}
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Singkat</label>
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  maxLength={NAME_MAX}
                  onChange={(e) => setField("short_name", e.target.value.replace(/[^A-Za-z -]/g, ""))}
                  disabled={isPending}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm ${errors.short_name ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500"}`}
                />
                <p className={`text-[11px] mt-1.5 ${errors.short_name ? "text-rose-600" : "text-gray-500"}`}>
                  {errors.short_name || `Maksimal ${NAME_MAX} karakter.`}
                </p>
              </div>
            </div>

            {/* ─── Kontak & Lokasi ─── */}
            <div className="bg-gray-50/80 -mx-6 md:-mx-8 px-6 md:px-8 py-8 border-t border-b border-gray-100 space-y-6">
              <h3 className="font-bold tracking-widest text-gray-800 uppercase text-sm">Kontak & Lokasi</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provinsi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Provinsi</label>
                  <CustomSelect
                    key={`province-${formData.province}-${provinces.length}`}
                    name="province_display"
                    options={provinceOptions}
                    defaultValue={formData.province}
                    onChange={handleProvinceChange}
                    disabled={isPending || isProvLoading}
                  />
                </div>

                {/* Kabupaten / Kota */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kabupaten / Kota</label>
                  <CustomSelect
                    key={`city-${formData.province}-${formData.city}-${cities.length}`}
                    name="city_display"
                    options={cityOptions}
                    defaultValue={formData.city}
                    onChange={(val) => setField("city", val)}
                    disabled={isPending || !formData.province || isCityLoading}
                  />
                </div>

                {/* Alamat Lengkap — full width */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Alamat Lengkap</label>
                  <textarea
                    name="address_full"
                    value={formData.address_full}
                    rows={4}
                    maxLength={TEXTAREA_MAX}
                    onChange={(e) => setField("address_full", e.target.value)}
                    disabled={isPending}
                    placeholder="Jl. Masjid No. 1, RT 01/RW 02, Kelurahan..."
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm resize-none ${errors.address_full ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500"}`}
                  />
                  <p className={`text-[11px] mt-1.5 ${errors.address_full ? "text-rose-600" : "text-gray-500"}`}>
                    {errors.address_full || `${formData.address_full.length}/${TEXTAREA_MAX} karakter.`}
                  </p>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">WhatsApp Takmir</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="phone_whatsapp"
                    value={formData.phone_whatsapp}
                    onChange={(e) => setField("phone_whatsapp", sanitizePhone(e.target.value))}
                    disabled={isPending}
                    placeholder="081234567890"
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm ${errors.phone_whatsapp ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-500"}`}
                  />
                  <p className={`text-[11px] mt-1.5 ${errors.phone_whatsapp ? "text-rose-600" : "text-gray-500"}`}>
                    {errors.phone_whatsapp || "Hanya angka."}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Publik</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    disabled={isPending}
                    placeholder="takmir@masjid.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 disabled:bg-gray-100 shadow-sm"
                  />
                </div>

                {/* Subdomain — locked */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subdomain Portal Jamaah</label>
                  <input
                    type="text"
                    value={initialData.subdomain ? getPublicPortalDisplay(initialData.subdomain) : "Belum diatur"}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* ─── Actions ─── */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => void handleCloseEdit()}
                disabled={isPending}
                className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 font-semibold py-2.5 px-5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" /> Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
              >
                {isUploading ? "Mengunggah foto..." : isPending ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan</>}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
