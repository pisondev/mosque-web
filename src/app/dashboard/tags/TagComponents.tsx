"use client";

import { useState, useTransition } from "react";
import { createTag, deleteTag } from "../../actions/tags";

// 1. Komponen Form Tambah Tag
export function CreateTagForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const res = await createTag(formData);
      
      if (res?.error) {
        setError(res.error);
      } else {
        // Reset form jika sukses
        (document.getElementById("form-tag") as HTMLFormElement).reset();
      }
    });
  };

  return (
    <form id="form-tag" action={handleAction} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Label / Tag</label>
        <input
          type="text"
          name="name"
          placeholder="Contoh: Ramadhan 1447"
          required
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Peruntukan (Scope)</label>
        <select 
          name="scope" 
          required
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white disabled:bg-gray-100"
        >
          <option value="post">Artikel & Berita (Post)</option>
          <option value="event">Agenda Kajian (Event)</option>
          <option value="gallery">Galeri Foto/Video</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {isPending ? "Menyimpan..." : "+ Tambah Tag"}
      </button>
    </form>
  );
}

// 2. Komponen Tombol Hapus
export function DeleteTagButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Yakin ingin menghapus tag ini?")) {
      startTransition(async () => {
        const res = await deleteTag(id);
        if (res?.error) {
          alert(res.error); // Tampilkan alert jika gagal (misal: Tag masih dipakai)
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
    >
      {isPending ? "Menghapus..." : "Hapus"}
    </button>
  );
}