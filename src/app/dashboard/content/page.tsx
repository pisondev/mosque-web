import Link from "next/link";
import { getPosts } from "../../actions/posts";
import { DeletePostButton, ToggleStatusButton } from "./ContentComponents";
import { FileText, Plus, LayoutTemplate, Edit3, Newspaper } from "lucide-react";

type PostTag = { id: number; name: string; };
type PostItem = { id: number; title: string; slug: string; status: string; tags?: PostTag[]; };

export default async function ContentPage() {
  const res = await getPosts();
  const posts: PostItem[] = Array.isArray(res?.data) ? res.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Artikel & Pengumuman</h2>
            <p className="text-gray-500 text-sm mt-1">Tulis dan kelola konten bacaan untuk website publik masjid.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/static-pages"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <LayoutTemplate className="w-4 h-4" /> Halaman Statis
          </Link>
          <Link
            href="/dashboard/content/create"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tulis Artikel
          </Link>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Judul Artikel</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Kategori (Tag)</th>
                <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px] w-36">Status</th>
                <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex justify-center mb-4"><FileText className="w-12 h-12 text-gray-300" /></div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Belum ada tulisan</h3>
                    <p className="text-gray-500 text-sm">Klik tombol "Tulis Artikel" di kanan atas untuk mulai membuat konten.</p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{post.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm truncate" title={`/${post.slug}`}>/{post.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-100 rounded-md">
                        {post.tags && post.tags.length > 0 ? post.tags[0].name : "Tanpa Label"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <ToggleStatusButton id={post.id} currentStatus={post.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/dashboard/content/${post.id}/edit`}
                          title="Edit Artikel"
                          className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <DeletePostButton id={post.id} title={post.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}