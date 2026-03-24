import { getStaticPages } from "../../actions/static-pages";
import StaticPageEditor from "./StaticPageEditor";
import { LayoutTemplate } from "lucide-react";

type StaticPageItem = {
  slug: string;
  title: string;
  excerpt: string;
  content_markdown: string;
};

export default async function StaticPagesPage() {
  const res = await getStaticPages();
  const pages: StaticPageItem[] = Array.isArray(res?.data) ? res.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Halaman Statis</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola halaman tetap profil masjid seperti Tentang Kami, Visi Misi, dan Kontak.
          </p>
        </div>
      </div>

      <StaticPageEditor pages={pages} />
    </div>
  );
}