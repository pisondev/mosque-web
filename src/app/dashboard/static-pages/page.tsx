import { getStaticPages } from "../../actions/static-pages";
import StaticPageEditor from "./StaticPageEditor";

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
    <div className="max-w-6xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Halaman Statis</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelola halaman tetap seperti Tentang Kami, Visi Misi, dan Kontak.
        </p>
      </div>

      <StaticPageEditor pages={pages} />
    </div>
  );
}
