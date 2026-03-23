import { getTags } from "../../actions/tags";
import { CreateTagForm, DeleteTagButton } from "./TagComponents";

export default async function TagsPage() {
  // Tarik data langsung dari server sebelum HTML dikirim ke browser
  const res = await getTags();
  const tags = res?.data || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kategori & Tag</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelompokkan artikel, agenda, dan galeri masjid Anda agar lebih rapi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Tambah */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Buat Tag Baru</h3>
            <CreateTagForm />
          </div>
        </div>

        {/* Kolom Kanan: Tabel Data */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 font-semibold">Nama Tag</th>
                    <th className="p-4 font-semibold">Slug (URL)</th>
                    <th className="p-4 font-semibold">Peruntukan</th>
                    <th className="p-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tags.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Belum ada tag yang dibuat.
                      </td>
                    </tr>
                  ) : (
                    tags.map((tag: any) => (
                      <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{tag.name}</td>
                        <td className="p-4 text-gray-500 text-sm font-mono">{tag.slug}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                            ${tag.scope === 'post' ? 'bg-blue-100 text-blue-800' : 
                              tag.scope === 'event' ? 'bg-green-100 text-green-800' : 
                              'bg-purple-100 text-purple-800'}`}
                          >
                            {tag.scope}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <DeleteTagButton id={tag.id} />
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