"use client";

import { useTransition } from "react";
import { deletePost, togglePostStatus } from "../../actions/posts";

export function DeletePostButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Yakin ingin menghapus artikel ini permanen?")) {
      startTransition(async () => {
        const res = await deletePost(String(id));
        if (res?.error) alert(res.error);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
    >
      {isPending ? "Menghapus..." : "Hapus"}
    </button>
  );
}

export function ToggleStatusButton({ id, currentStatus }: { id: number; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const isPublished = currentStatus === "published";

  const handleToggle = () => {
    const newStatus = isPublished ? "draft" : "published";
    startTransition(async () => {
      const res = await togglePostStatus(String(id), newStatus);
      if (res?.error) alert(res.error);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-50 ${
        isPublished 
          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
      }`}
    >
      {isPending ? "Updating..." : isPublished ? "🟢 Published" : "⚪ Draft"}
    </button>
  );
}
