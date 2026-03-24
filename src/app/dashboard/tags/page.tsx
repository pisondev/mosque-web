import { getTags } from "../../actions/tags";
import { CreateTagForm, DeleteTagButton, EditTagForm } from "./TagComponents";
import { Tags as TagsIcon, Tag as TagIcon } from "lucide-react";

type TagItem = {
  id: number;
  name: string;
  slug: string;
  scope: string;
};

export default async function TagsPage() {
  const res = await getTags();
  const tags: TagItem[] = Array.isArray(res?.data) ? res.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Halaman */}
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <TagsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kategori & Tag</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelompokkan artikel, agenda, dan galeri masjid Anda agar lebih terstruktur.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Kolom Kiri: Form Tambah (Sticky) */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-emerald-600" /> Buat Tag Baru
            </h3>
            <CreateTagForm />
          </div>
        </div>

        {/* Kolom Kanan: Tabel Data */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Daftar Tag Terdaftar</h3>
            </div>

            <div className="overflow-x-auto pb-24">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-white text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Nama Tag</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Slug (URL)</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Peruntukan</th>
                    <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tags.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="flex justify-center mb-3"><TagsIcon className="w-10 h-10 text-gray-300" /></div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Belum ada tag</h3>
                        <p className="text-gray-500 text-sm">Buat tag pertamamu menggunakan form di samping.</p>
                      </td>
                    </tr>
                  ) : (
                    tags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-emerald-50/30 transition-colors group h-16">
                        <td className="px-5 py-3 font-bold text-gray-900">{tag.name}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs font-mono">{tag.slug}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md border shadow-sm
                            ${tag.scope === 'post' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                              tag.scope === 'event' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                              'bg-purple-50 text-purple-700 border-purple-100'}`}
                          >
                            {tag.scope === 'post' ? '📝 Post' : tag.scope === 'event' ? '📅 Event' : '📸 Gallery'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditTagForm id={tag.id} name={tag.name} />
                            <DeleteTagButton id={tag.id} name={tag.name} />
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

      </div>
    </div>
  );
}