import { listGalleryAlbums, listGalleryItems } from "../../actions/community";
import GalleryManager from "./GalleryManager";

export default async function GalleryPage() {
  const [albumsRes, itemsRes] = await Promise.all([
    listGalleryAlbums(1, 100),
    listGalleryItems(1, 200)
  ]);

  const albums = Array.isArray(albumsRes?.data) ? albumsRes.data : [];
  const items = Array.isArray(itemsRes?.data) ? itemsRes.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-800">Galeri & Dokumentasi</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelola album kegiatan dan unggah dokumentasi foto/video untuk ditampilkan di website publik.
        </p>
      </div>

      <GalleryManager initialAlbums={albums} initialItems={items} />
    </div>
  );
}