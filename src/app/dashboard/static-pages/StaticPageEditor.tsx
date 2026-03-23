"use client";

import { useState, useTransition } from "react";
import { upsertStaticPage } from "../../actions/static-pages";

type StaticPageItem = {
  slug: string;
  title: string;
  excerpt: string;
  content_markdown: string;
};

const DEFAULT_PAGES = [
  { slug: "tentang-kami", title: "Tentang Kami" },
  { slug: "visi-misi", title: "Visi Misi" },
  { slug: "kontak", title: "Kontak" },
];

export default function StaticPageEditor({ pages }: { pages: StaticPageItem[] }) {
  const [activeSlug, setActiveSlug] = useState<string>(DEFAULT_PAGES[0].slug);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activePage = pages.find((page) => page.slug === activeSlug);
  const defaultMeta = DEFAULT_PAGES.find((item) => item.slug === activeSlug);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-fit">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Daftar Halaman</p>
        <div className="space-y-2">
          {DEFAULT_PAGES.map((item) => (
            <button
              key={item.slug}
              onClick={() => {
                setMessage(null);
                setActiveSlug(item.slug);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSlug === item.slug
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form
          action={(formData) => {
            startTransition(async () => {
              setMessage(null);
              const res = await upsertStaticPage(activeSlug, formData);
              setMessage(res?.error || "Halaman statis berhasil disimpan.");
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={activeSlug}
              disabled
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Halaman</label>
            <input
              type="text"
              name="title"
              defaultValue={activePage?.title || defaultMeta?.title || ""}
              required
              disabled={isPending}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ringkasan</label>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={activePage?.excerpt || ""}
              disabled={isPending}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Konten Markdown</label>
            <textarea
              name="content"
              rows={14}
              defaultValue={activePage?.content_markdown || ""}
              required
              disabled={isPending}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            ></textarea>
          </div>

          {message && (
            <div
              className={`text-sm rounded-lg px-3 py-2 border ${
                message.includes("berhasil")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
          >
            {isPending ? "Menyimpan..." : "Simpan Halaman"}
          </button>
        </form>
      </section>
    </div>
  );
}
