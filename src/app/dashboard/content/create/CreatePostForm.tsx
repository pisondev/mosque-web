"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "../../../actions/posts";

// Definisi Tipe Tag agar TypeScript senang
interface Tag {
  id: number;
  name: string;
  scope: string;
}

export default function CreatePostForm({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const res = await createPost(formData);
      
      if (res?.error) {
        setError(res.error);
      } else {
        router.refresh(); 
        router.push("/dashboard/content");
      }
    });
  };

  return (
    <form action={handleAction} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Artikel</label>
              <input
                type="text"
                name="title"
                placeholder="Contoh: Jadwal Kajian Rutin Ramadhan 1447H"
                required
                disabled={isPending}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg text-gray-900 disabled:bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ringkasan</label>
              <textarea
                name="excerpt"
                rows={3}
                placeholder="Ringkasan singkat untuk preview halaman publik."
                disabled={isPending}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 disabled:bg-gray-100"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Isi Konten (Format Markdown)
              </label>
              <textarea
                name="content"
                rows={15}
                placeholder="Tulis pengumuman atau berita masjid di sini. Anda bisa menggunakan sintaks Markdown (# Judul, **Tebal**, dll)."
                required
                disabled={isPending}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed text-gray-900 disabled:bg-gray-100"
              ></textarea>
              <p className="text-xs text-gray-400 mt-2">Isi tulisan Anda akan dikonversi menjadi HTML di website jamaah.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Pengaturan Publikasi</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Konten (Wajib)</label>
              <select 
                name="category" 
                required 
                disabled={isPending}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="" disabled selected>-- Pilih Jenis --</option>
                <option value="announcement">📢 Pengumuman</option>
                <option value="news_activity">📰 Berita & Kegiatan</option>
                <option value="reflection">📖 Renungan / Kajian</option>
                <option value="static_page">📌 Halaman Statis (Profil, dll)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status Publikasi</label>
              <select 
                name="status" 
                disabled={isPending}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none text-gray-900 bg-white disabled:bg-gray-100"
              >
                <option value="published">🟢 Publikasikan Langsung</option>
                <option value="draft">⚪ Simpan sebagai Draft</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori / Label</label>
              <select 
                name="tag_id" 
                disabled={isPending}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none text-gray-900 bg-white disabled:bg-gray-100"
              >
                <option value="">-- Tanpa Label --</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center shadow-md shadow-blue-200"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan Artikel...
                </>
              ) : (
                "💾 Simpan & Publikasikan"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
