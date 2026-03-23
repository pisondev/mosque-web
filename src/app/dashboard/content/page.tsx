import Link from "next/link";
import { getPosts } from "../../actions/posts";
import { DeletePostButton, ToggleStatusButton } from "./ContentComponents";

type PostTag = {
  id: number;
  name: string;
};

type PostItem = {
  id: number;
  title: string;
  slug: string;
  status: string;
  tags?: PostTag[];
};

export default async function ContentPage() {
  const res = await getPosts();
  const posts: PostItem[] = Array.isArray(res?.data) ? res.data : [];

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Artikel & Pengumuman</h2>
          <p className="text-gray-500 text-sm mt-1">
            Tulis dan kelola konten yang akan tampil di website publik masjid.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/static-pages"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            Halaman Statis
          </Link>
          <Link
            href="/dashboard/content/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <span>✍️</span> Tulis Artikel Baru
          </Link>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Judul Artikel</th>
                <th className="p-4 font-semibold">Kategori (Tag)</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="text-4xl mb-3">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada artikel</h3>
                    <p className="text-gray-500 text-sm">Klik tombol &quot;Tulis Artikel Baru&quot; untuk mulai membuat konten.</p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">/{post.slug}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                        {post.tags && post.tags.length > 0 ? post.tags[0].name : "Tanpa Kategori"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <ToggleStatusButton id={post.id} currentStatus={post.status} />
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Link
                        href={`/dashboard/content/${post.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <DeletePostButton id={post.id} />
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
