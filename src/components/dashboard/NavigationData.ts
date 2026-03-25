import { 
  LayoutDashboard, Building2, CalendarDays, BookOpen, 
  Settings, Banknote, Users, Megaphone, Link2, 
  FileText, Tags, Image as ImageIcon, Globe,
  Target, CreditCard // <-- Tambahan ikon baru
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
    // Mengubah sedikit nama grup agar lebih merepresentasikan isinya
    title: "Kegiatan & Keuangan", 
    icon: CalendarDays,
    items: [
      { name: "Jadwal & Agenda", path: "/dashboard/agenda", icon: CalendarDays },
      { name: "Manajemen Event", path: "/dashboard/events", icon: Megaphone },
      { name: "Rekening & QRIS", path: "/dashboard/finance/static-accounts", icon: Banknote },
      { name: "Program Donasi", path: "/dashboard/finance/campaigns", icon: Target }, // <-- Menu Baru
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
      { name: "Payment Gateway", path: "/dashboard/finance/settings", icon: CreditCard }, // <-- Menu Baru diletakkan di area Sistem
    ]
  }
];

// Flatten data untuk keperluan fitur Search di Header
export const FLAT_MENU = MENU_DATA.flatMap(group => group.items);