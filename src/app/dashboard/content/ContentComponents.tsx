"use client";

import { useTransition } from "react";
import { deletePost, togglePostStatus } from "../../actions/posts";
import { useToast } from "../../../components/ui/Toast";
import { useDecisionModal } from "../../../components/ui/DecisionModalProvider";
import { Trash2, Globe, FileLock2 } from "lucide-react";

export function DeletePostButton({ id, title }: { id: number, title: string }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const { confirm } = useDecisionModal();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Hapus artikel?",
      description: `Artikel "${title}" akan dihapus permanen dan tidak bisa dikembalikan.`,
      confirmLabel: "Hapus Artikel",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deletePost(String(id));
      if (res?.error) addToast(res.error, "error");
      else addToast("Artikel berhasil dihapus.", "success");
    });
  };

  return (
    <button
      onClick={() => void handleDelete()}
      disabled={isPending}
      title="Hapus Artikel"
      className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export function ToggleStatusButton({ id, currentStatus }: { id: number; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const isPublished = currentStatus === "published";

  const handleToggle = () => {
    const newStatus = isPublished ? "draft" : "published";
    startTransition(async () => {
      const res = await togglePostStatus(String(id), newStatus);
      if (res?.error) addToast(res.error, "error");
      else addToast(`Status diubah menjadi ${newStatus.toUpperCase()}`, "success");
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95 disabled:opacity-50 w-28 ${
        isPublished 
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
          : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
      }`}
    >
      {isPending ? "Updating..." : isPublished ? <><Globe className="w-3 h-3"/> Publik</> : <><FileLock2 className="w-3 h-3"/> Draft</>}
    </button>
  );
}
