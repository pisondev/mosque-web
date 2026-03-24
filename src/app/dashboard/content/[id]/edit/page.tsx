import Link from "next/link";
import { redirect } from "next/navigation";
import { getPostDetail } from "../../../../actions/posts";
import { getTags } from "../../../../actions/tags";
import EditPostForm from "./EditPostForm";
import { ArrowLeft, Edit3 } from "lucide-react";

type Tag = { id: number; name: string; scope: string; };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [postRes, tagRes] = await Promise.all([getPostDetail(id), getTags()]);

  if (postRes?.status !== "success" || !postRes?.data) {
    redirect("/dashboard/content");
  }

  const tags: Tag[] = (Array.isArray(tagRes?.data) ? tagRes.data : []).filter(
    (tag: Tag) => tag.scope === "post"
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
            <Edit3 className="w-6 h-6 text-emerald-600" /> Edit Artikel
          </h2>
          <p className="text-gray-500 text-sm mt-1">Perbarui konten agar informasi yang diterima jamaah tetap akurat.</p>
        </div>
      </div>

      <EditPostForm post={postRes.data} tags={tags} />
      
    </div>
  );
}