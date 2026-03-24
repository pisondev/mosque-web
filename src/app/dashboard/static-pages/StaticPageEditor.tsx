"use client";

import { useState, useTransition } from "react";
import { upsertStaticPage } from "../../actions/static-pages";
import { useToast } from "../../../components/ui/Toast";
import { Layout, FileText, Save, Link as LinkIcon, Info } from "lucide-react";

type StaticPageItem = {
  slug: string;
  title: string;
  excerpt: string;
  content_markdown: string;
};

const DEFAULT_PAGES = [
  { slug: "tentang-kami", title: "Tentang Kami", icon: Info },
  { slug: "visi-misi", title: "Visi & Misi", icon: Layout },
  { slug: "kontak", title: "Informasi Kontak", icon: LinkIcon },
];

export default function StaticPageEditor({ pages }: { pages: StaticPageItem[] }) {
  const [activeSlug, setActiveSlug] = useState<string>(DEFAULT_PAGES[0].slug);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const activePage = pages.find((page) => page.slug === activeSlug);
  const defaultMeta = DEFAULT_PAGES.find((item) => item.slug === activeSlug);

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      const res = await upsertStaticPage(activeSlug, formData);
      if (res?.error) {
        addToast(res.error, "error");
      } else {
        addToast(`Halaman "${defaultMeta?.title}" berhasil disimpan!`, "success");
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      
      {/* SIDEBAR: Daftar Halaman */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
        <div className="bg-gray-50/50 border-b border-gray-100 px-5 py-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Halaman</p>
        </div>
        <div className="p-3 space-y-1">
          {DEFAULT_PAGES.map((item) => {
            const isActive = activeSlug === item.slug;
            return (
              <button
                key={item.slug}
                onClick={() => setActiveSlug(item.slug)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                {item.title}
              </button>
            );
          })}
        </div>
      </aside>

      {/* EDITOR UTAMA: Kanvas Penulisan */}
      <section className="flex-1 w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase">Kanvas Halaman</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
            <LinkIcon className="w-3 h-3 text-gray-400" /> /{activeSlug}
          </div>
        </div>

        {/* Gunakan key={activeSlug} agar saat ganti tab, nilai default di form ker-reset! */}
        <form key={activeSlug} action={handleSave} className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
          
          <div className="p-6 md:p-8 space-y-6 flex-1">
            {/* Input Judul Utama */}
            <div>
              <input
                type="text"
                name="title"
                defaultValue={activePage?.title || defaultMeta?.title || ""}
                placeholder="Judul Halaman..."
                required
                disabled={isPending}
                className="w-full text-3xl font-extrabold text-gray-900 placeholder:text-gray-300 outline-none disabled:opacity-50 transition-all focus:ring-0 border-none px-0 bg-transparent"
              />
            </div>

            {/* Input Ringkasan */}
            <div>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={activePage?.excerpt || ""}
                placeholder="Tulis ringkasan singkat untuk SEO atau meta description (opsional)..."
                disabled={isPending}
                className="w-full text-sm font-medium text-gray-600 placeholder:text-gray-400 outline-none resize-none disabled:opacity-50 transition-all border-l-2 border-emerald-300 bg-emerald-50/30 pl-4 py-2.5 rounded-r-lg focus:ring-0"
              ></textarea>
            </div>

            {/* Input Konten Markdown */}
            <div className="pt-2 border-t border-gray-100">
              <textarea
                name="content"
                rows={16}
                defaultValue={activePage?.content_markdown || ""}
                placeholder={`Tulis isi halaman ${defaultMeta?.title} di sini menggunakan format Markdown...`}
                required
                disabled={isPending}
                className="w-full outline-none font-mono text-sm leading-relaxed text-gray-800 placeholder:text-gray-300 disabled:opacity-50 resize-y focus:ring-0 border-none px-0 mt-4 bg-transparent"
              ></textarea>
            </div>
          </div>

          {/* Area Tombol Simpan */}
          <div className="px-6 md:px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-[10px] text-gray-400 font-medium">
              Data disimpan dalam bentuk teks murni (Markdown).
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              {isPending ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan Halaman</>}
            </button>
          </div>
        </form>

      </section>
    </div>
  );
}