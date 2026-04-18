import { 
  LayoutDashboard, Building2, CalendarDays, BookOpen, 
  Settings, Banknote, Users, Megaphone, Link2, 
  FileText, Tags, Image as ImageIcon, Globe,
  Target, CreditCard, LayoutTemplate
} from "lucide-react";

export const MENU_DATA = [
  {
    title: "Dasbor & Profil",
    icon: LayoutDashboard,
    items: [
      { name: "Ikhtisar", path: "/dashboard", icon: LayoutDashboard }, // Selalu terbuka
      { name: "Profil Masjid", path: "/dashboard/profile", icon: Building2, requiredFeature: "profile" },
      { name: "Susunan Pengurus", path: "/dashboard/management", icon: Users, requiredFeature: "management" },
      { name: "Tampilan Website", path: "/dashboard/templates", icon: LayoutTemplate },
      { name: "Kelola Langganan", path: "/dashboard/subscription", icon: CreditCard },
    ]
  },
  {
    title: "Kegiatan & Keuangan", 
    icon: CalendarDays,
    items: [
      { name: "Jadwal & Agenda", path: "/dashboard/agenda", icon: CalendarDays, requiredFeature: "schedules" },
      { name: "Manajemen Event", path: "/dashboard/events", icon: Megaphone, requiredFeature: "events" },
      { name: "Rekening & QRIS", path: "/dashboard/finance/static-accounts", icon: Banknote, requiredFeature: "static_payment" },
      { name: "Program Donasi", path: "/dashboard/finance/campaigns", icon: Target, requiredFeature: "pg_digital" },
      { name: "Tautan Publik", path: "/dashboard/links", icon: Link2 }, 
    ]
  },
  {
    title: "Konten Publikasi",
    icon: BookOpen,
    items: [
      { name: "Artikel & Berita", path: "/dashboard/content", icon: FileText, requiredFeature: "articles" },
      { name: "Halaman Statis", path: "/dashboard/static-pages", icon: FileText }, 
      { name: "Kategori & Tag", path: "/dashboard/tags", icon: Tags },
      { name: "Galeri Media", path: "/dashboard/gallery", icon: ImageIcon, requiredFeature: "gallery" },
    ]
  },
  {
    title: "Sistem",
    icon: Settings,
    items: [
      { name: "Fasilitas Layanan", path: "/dashboard/features", icon: Settings, requiredFeature: "facilities" },
      { name: "Pengaturan Domain", path: "/dashboard/domains", icon: Globe },
      { name: "Payment Gateway", path: "/dashboard/finance/settings", icon: CreditCard, requiredFeature: "pg_digital" },
    ]
  }
];

export const FLAT_MENU = MENU_DATA.flatMap(group => group.items);
