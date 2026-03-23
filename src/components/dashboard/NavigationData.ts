import { 
  LayoutDashboard, Building2, CalendarDays, BookOpen, 
  Settings, Banknote, Users, Megaphone, Link2, 
  FileText, Tags, Image as ImageIcon, Globe 
} from "lucide-react";

export const MENU_DATA = [
  {
    title: "Dasbor & Profil",
    icon: LayoutDashboard,
    items: [
      { name: "Ikhtisar", path: "/dashboard", icon: LayoutDashboard },
      { name: "Profil Masjid", path: "/dashboard/profile", icon: Building2 },
      { name: "Susunan Pengurus", path: "/dashboard/management", icon: Users },
    ]
  },
  {
    title: "Kegiatan & Donasi",
    icon: CalendarDays,
    items: [
      { name: "Jadwal & Agenda", path: "/dashboard/agenda", icon: CalendarDays },
      { name: "Manajemen Event", path: "/dashboard/events", icon: Megaphone },
      { name: "Kanal Donasi", path: "/dashboard/donations", icon: Banknote },
      { name: "Tautan Publik", path: "/dashboard/links", icon: Link2 },
    ]
  },
  {
    title: "Konten Publikasi",
    icon: BookOpen,
    items: [
      { name: "Artikel & Berita", path: "/dashboard/content", icon: FileText },
      { name: "Halaman Statis", path: "/dashboard/static-pages", icon: FileText },
      { name: "Kategori & Tag", path: "/dashboard/tags", icon: Tags },
      { name: "Galeri Media", path: "/dashboard/gallery", icon: ImageIcon },
    ]
  },
  {
    title: "Sistem",
    icon: Settings,
    items: [
      { name: "Fasilitas Layanan", path: "/dashboard/features", icon: Settings },
      { name: "Pengaturan Domain", path: "/dashboard/domains", icon: Globe },
    ]
  }
];

// Flatten data untuk keperluan fitur Search di Header
export const FLAT_MENU = MENU_DATA.flatMap(group => group.items);