import Link from "next/link";
import { getTags } from "../../../actions/tags";
import CreatePostForm from "./CreatePostForm";
import { ArrowLeft, PenTool } from "lucide-react";

type TagItem = { id: number; name: string; scope: string; };

export default async function CreatePostPage() {
  const res = await getTags();
  const tags = (Array.isArray(res?.data) ? res.data : []).filter(
    (tag: TagItem) => tag.scope === "post"
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <Link 
          href="/dashboard/content"
          className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 shadow-sm"
          title="Kembali ke Daftar Artikel"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PenTool className="w-6 h-6 text-emerald-600" /> Tulis Artikel Baru
          </h2>
          <p className="text-gray-500 text-sm mt-1">Buat konten pengumuman, kajian, atau berita masjid untuk jamaah.</p>
        </div>
      </div>

      <CreatePostForm tags={tags} />

    </div>
  );
}