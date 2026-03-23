"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePost } from "../../../../actions/posts";

type Tag = {
  id: number;
  name: string;
};

type PostData = {
  id: number;
  title: string;
  category: string;
  status: string;
  content_markdown: string;
  excerpt: string;
  tags?: Tag[];
};

export default function EditPostForm({
  post,
  tags,
}: {
  post: PostData;
  tags: Tag[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTagId = post.tags && post.tags.length > 0 ? post.tags[0].id : "";

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const res = await updatePost(String(post.id), formData);
          if (res?.error) {
            setError(res.error);
            return;
          }
          router.push("/dashboard/content");
          router.refresh();
        });
      }}
      className="space-y-6"
    >
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 font-medium">
          {error}
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
                defaultValue={post.title}
                required
                disabled={isPending}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg text-gray-900 disabled:bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ringkasan</label>
              <textarea
                name="excerpt"
                defaultValue={post.excerpt}
                rows={3}
                disabled={isPending}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Isi Konten (Markdown)</label>
              <textarea
                name="content"
                rows={15}
                defaultValue={post.content_markdown}
                required
                disabled={isPending}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed text-gray-900 disabled:bg-gray-100"
              ></textarea>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Pengaturan Publikasi</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Konten</label>
              <select
                name="category"
                required
                defaultValue={post.category}
                disabled={isPending}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="announcement">Pengumuman</option>
                <option value="news_activity">Berita & Kegiatan</option>
                <option value="reflection">Renungan / Kajian</option>
                <option value="static_page">Halaman Statis</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status Publikasi</label>
              <select
                name="status"
                defaultValue={post.status}
                disabled={isPending}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none text-gray-900 bg-white disabled:bg-gray-100"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tag</label>
              <select
                name="tag_id"
                defaultValue={selectedTagId}
                disabled={isPending}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none text-gray-900 bg-white disabled:bg-gray-100"
              >
                <option value="">-- Tanpa Label --</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
