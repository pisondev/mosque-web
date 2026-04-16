"use client";

import { useState, useTransition, useRef } from "react";
import { createTag, deleteTag, updateTag } from "../../actions/tags";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useToast } from "../../../components/ui/Toast";
import { useDecisionModal } from "../../../components/ui/DecisionModalProvider";
import { Plus, Edit3, Trash2, Check, X } from "lucide-react";

// 1. Komponen Form Tambah Tag
export function CreateTagForm() {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const res = await createTag(formData);
      
      if (res?.error) {
        addToast(res.error, "error");
      } else {
        addToast("Tag baru berhasil ditambahkan!", "success");
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} action={handleAction} className="space-y-6">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Label / Tag <span className="text-rose-500">*</span></label>
        <input
          type="text"
          name="name"
          placeholder="Cth: Ramadhan 1447"
          required
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900 disabled:bg-gray-100 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Peruntukan (Scope) <span className="text-rose-500">*</span></label>
        <CustomSelect 
          name="scope"
          defaultValue="post"
          disabled={isPending}
          options={[
            { label: "Artikel & Berita (Post)", value: "post" },
            { label: "Agenda Kajian (Event)", value: "event" },
            { label: "Galeri Foto/Video", value: "gallery" }
          ]}
        />
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95"
        >
          {isPending ? "Menyimpan..." : <><Plus className="w-4 h-4" /> Tambah Tag</>}
        </button>
      </div>
    </form>
  );
}

// 2. Komponen Inline Edit Tag
export function EditTagForm({ id, name }: { id: number; name: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        title="Edit Tag"
        className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-md border border-gray-200 hover:border-emerald-200 transition-colors shadow-sm"
      >
        <Edit3 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          formData.set("id", String(id));
          const res = await updateTag(formData);
          if (res?.error) {
            addToast(res.error, "error");
          } else {
            addToast("Nama tag berhasil diperbarui!", "success");
            setIsEditing(false);
          }
        });
      }}
      className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4"
    >
      <input
        type="text"
        name="name"
        defaultValue={name}
        required
        disabled={isPending}
        autoFocus
        className="w-36 px-2.5 py-1.5 rounded-md border border-emerald-300 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 shadow-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        title="Simpan Perubahan"
        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md transition-colors"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsEditing(false)}
        title="Batal"
        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}

// 3. Komponen Hapus Tag
export function DeleteTagButton({ id, name }: { id: number, name: string }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const { confirm } = useDecisionModal();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Hapus tag?",
      description: `Tag "${name}" akan dihapus dari daftar.`,
      confirmLabel: "Hapus Tag",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteTag(id);
      if (res?.error) {
        addToast(res.error, "error");
      } else {
        addToast(`Tag ${name} berhasil dihapus.`, "success");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={() => void handleDelete()}
      disabled={isPending}
      title="Hapus Tag"
      className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
