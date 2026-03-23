"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertProfileAction } from "../../actions/profile";

type ProfileInitialData = {
  official_name: string;
  kind: string;
  short_name: string;
  city: string;
  address_full: string;
  phone_whatsapp: string;
  email: string;
  subdomain: string;
};

export default function ProfileForm({ initialData }: { initialData: ProfileInitialData }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const res = await upsertProfileAction(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Resmi Masjid</label>
          <input
            type="text"
            name="official_name"
            defaultValue={initialData.official_name}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Tempat</label>
          <select
            name="kind"
            defaultValue={initialData.kind}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100"
          >
            <option value="masjid">Masjid</option>
            <option value="musala">Musala</option>
            <option value="surau">Surau</option>
            <option value="langgar">Langgar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Singkat</label>
          <input
            type="text"
            name="short_name"
            defaultValue={initialData.short_name}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Kota</label>
          <input
            type="text"
            name="city"
            defaultValue={initialData.city}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor WhatsApp</label>
          <input
            type="text"
            name="phone_whatsapp"
            defaultValue={initialData.phone_whatsapp}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
          <textarea
            name="address_full"
            defaultValue={initialData.address_full}
            rows={3}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Kontak</label>
          <input
            type="email"
            name="email"
            defaultValue={initialData.email}
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Subdomain Aktif</label>
          <input
            type="text"
            value={initialData.subdomain ? `${initialData.subdomain}.mosquesaas.com` : "-"}
            disabled
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-600"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
      >
        {isPending ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </form>
  );
}
