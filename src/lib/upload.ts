"use client";

export type UploadKind = "header" | "management_photo" | "event_poster" | "qris";

export async function uploadImageFile(
  file: File,
  kind: UploadKind,
  oldUrl?: string
): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  if (oldUrl) {
    form.append("old_url", oldUrl);
  }

  const res = await fetch(`/api/upload?kind=${kind}`, {
    method: "POST",
    body: form,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.url) {
    throw new Error(json?.message || "Gagal mengunggah gambar");
  }

  return { url: json.data.url as string };
}
