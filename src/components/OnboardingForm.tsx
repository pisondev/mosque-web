"use client";

import { useState } from "react";
import { setupTenantAction } from "../app/actions/tenant";
import { useRouter } from "next/navigation"; // <-- Tambahan

export default function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // <-- Tambahan

  async function handleAction(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await setupTenantAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false); // Matikan loading jika error
    } else {
      // Jika SUKSES: Paksa Next.js memuat ulang komponen Server (halaman dashboard)
      router.refresh(); 
      // Kita biarkan isLoading tetap true agar tombol tetap berkata "Menyimpan Data..." 
      // sampai halaman benar-benar berpindah dalam sekian milidetik.
    }
  }

  return (
    <form action={handleAction} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          ⚠️ {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Masjid Asli</label>
        <input
          type="text"
          name="name"
          placeholder="Contoh: Masjid Agung Sleman"
          required
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Subdomain Pilihan</label>
        <div className="flex">
          <input
            type="text"
            name="subdomain"
            placeholder="masjid-agung-sleman"
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
          />
          <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            .mosquesaas.com
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Gunakan huruf kecil dan strip (-). Tanpa spasi.</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-4 flex justify-center items-center"
      >
        {isLoading ? "Menyimpan Data..." : "Simpan & Lanjutkan"}
      </button>
    </form>
  );
}