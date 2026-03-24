"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "../../../actions/posts";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { useToast } from "../../../../components/ui/Toast";
import { Save, Settings2, FileText, CheckCircle2 } from "lucide-react";

interface Tag { id: number; name: string; scope: string; }

export default function CreatePostForm({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const res = await createPost(formData);
      if (res?.error) {
        addToast(res.error, "error");
      } else {
        addToast("Artikel berhasil disimpan!", "success");
        router.refresh(); 
        router.push("/dashboard/content");
      }
    });
  };

  // Map tag data untuk CustomSelect
  const tagOptions = [
    { label: "-- Tanpa Label --", value: "" },
    ...tags.map(t => ({ label: t.name, value: String(t.id) }))
  ];

  return (
    <form action={handleAction} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: EDITOR KONTEN (Lebar 2 Kolom) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Header Editor */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-800 text-sm tracking-wide">KANVAS PENULISAN</h3>
            </div>

            <div className="p-6 md:p-8 space-y-6 flex-1">
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Judul Artikel..."
                  required
                  disabled={isPending}
                  className="w-full text-3xl font-extrabold text-gray-900 placeholder:text-gray-300 outline-none disabled:opacity-50 transition-all focus:ring-0 border-none px-0"
                />
              </div>

              <div>
                <textarea
                  name="excerpt"
                  rows={2}
                  placeholder="Ringkasan singkat (opsional) untuk preview di halaman depan..."
                  disabled={isPending}
                  className="w-full text-base text-gray-600 placeholder:text-gray-400 outline-none resize-none disabled:opacity-50 transition-all border-l-2 border-emerald-300 bg-emerald-50/30 pl-4 py-2 rounded-r-lg focus:ring-0"
                ></textarea>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <textarea
                  name="content"
                  rows={18}
                  placeholder="Tulis isi pengumuman atau berita di sini... (Mendukung format Markdown: **Tebal**, *Miring*, # Judul)"
                  required
                  disabled={isPending}
                  className="w-full outline-none font-mono text-sm leading-relaxed text-gray-800 placeholder:text-gray-300 disabled:opacity-50 resize-y focus:ring-0 border-none px-0 mt-4 bg-transparent"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: PENGATURAN PUBLIKASI (Lebar 1 Kolom, Sticky) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-5">
              <Settings2 className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-800 tracking-wide">Pengaturan Publikasi</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Jenis Konten</label>
                <CustomSelect 
                  name="category" 
                  defaultValue="announcement"
                  disabled={isPending}
                  options={[
                    { label: "📢 Pengumuman", value: "announcement" },
                    { label: "📰 Berita & Kegiatan", value: "news_activity" },
                    { label: "📖 Renungan / Kajian", value: "reflection" },
                    { label: "📌 Halaman Statis", value: "static_page" }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status Visibilitas</label>
                <CustomSelect 
                  name="status" 
                  defaultValue="published"
                  disabled={isPending}
                  options={[
                    { label: "🟢 Publikasikan Langsung", value: "published" },
                    { label: "⚪ Simpan Draft Tertutup", value: "draft" }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kategori (Label / Tag)</label>
                <CustomSelect 
                  name="tag_id" 
                  defaultValue=""
                  disabled={isPending}
                  options={tagOptions}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                {isPending ? (
                  <>Memproses...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Simpan Artikel</>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">
                Pastikan tulisan Anda mematuhi pedoman komunitas masjid.
              </p>
            </div>

          </div>
        </div>

      </div>
    </form>
  );
}