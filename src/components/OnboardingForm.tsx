"use client";

import { useState } from "react";
import { setupTenantAction } from "../app/actions/tenant";

export default function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await setupTenantAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      window.location.href = "/dashboard"; 
    }
  }

  return (
    // Spasi antar elemen diperkecil di mobile (space-y-4)
    <form action={handleAction} className="space-y-4 md:space-y-5">
      {error && (
        <div className="p-2.5 md:p-3 bg-red-50 text-red-600 text-xs md:text-sm rounded-lg border border-red-200">
          ⚠️ {error}
        </div>
      )}

      <div>
        {/* Font label lebih kecil di mobile */}
        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Nama Resmi Organisasi/Masjid</label>
        <input
          type="text"
          name="name"
          placeholder="Contoh: Masjid Agung Sleman"
          required
          disabled={isLoading}
          // Padding vertical (py) dan font input (text-sm vs text-base) disesuaikan
          className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 shadow-sm"
        />
        <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2 font-medium leading-relaxed">
          Nama ini akan digunakan sebagai identitas akun utama di sistem eTAKMIR. Anda bebas mengatur nama tampilan publik (Profil Masjid) nanti di dasbor.
        </p>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">Subdomain Pilihan</label>
        <div className="flex">
          <input
            type="text"
            name="subdomain"
            placeholder="masjid-agung-sleman"
            required
            disabled={isLoading}
            className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base rounded-l-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 shadow-sm"
          />
          <span className="inline-flex items-center px-3 md:px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-600 font-medium text-xs md:text-sm">
            .mosquesaas.com
          </span>
        </div>
        <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2 font-medium">Gunakan huruf kecil dan strip (-). Tanpa spasi.</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        // Tombol juga diperkecil tinggi dan teksnya saat di HP
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 md:py-3 px-4 text-sm md:text-base rounded-lg transition-colors mt-3 md:mt-4 flex justify-center items-center shadow-md"
      >
        {isLoading ? "Menyimpan Data..." : "Simpan & Lanjutkan"}
      </button>
    </form>
  );
}