import Link from "next/link";
import { getTags } from "../../../actions/tags";
import CreatePostForm from "./CreatePostForm";

type TagItem = {
  id: number;
  name: string;
  scope: string;
};

export default async function CreatePostPage() {
  const res = await getTags();
  const tags = (Array.isArray(res?.data) ? res.data : []).filter(
    (tag: TagItem) => tag.scope === "post"
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
          <h2 className="text-2xl font-bold text-gray-800">Tulis Artikel Baru</h2>
          <p className="text-gray-500 text-sm mt-1">Buat konten pengumuman, kajian, atau berita masjid.</p>
        </div>
      </div>

      <CreatePostForm tags={tags} />

    </div>
  );
}
