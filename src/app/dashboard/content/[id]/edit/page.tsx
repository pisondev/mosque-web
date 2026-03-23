import Link from "next/link";
import { redirect } from "next/navigation";
import { getPostDetail } from "../../../../actions/posts";
import { getTags } from "../../../../actions/tags";
import EditPostForm from "./EditPostForm";

type Tag = {
  id: number;
  name: string;
  scope: string;
};

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
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 border-b pb-4 mb-6">
        <Link
          href="/dashboard/content"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title="Kembali"
        >
          ⬅️
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Artikel</h2>
          <p className="text-gray-500 text-sm mt-1">Perbarui konten agar informasi jamaah tetap akurat.</p>
        </div>
      </div>

      <EditPostForm post={postRes.data} tags={tags} />
    </div>
  );
}
