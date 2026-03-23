"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Ikhtisar", path: "/dashboard", icon: "📊" },
    { name: "Domain & Akses", path: "/dashboard/domains", icon: "🌐" },
    { name: "Profil Masjid", path: "/dashboard/profile", icon: "🏛️" },
    { name: "Manajemen Artikel", path: "/dashboard/content", icon: "📝" },
    { name: "Halaman Statis", path: "/dashboard/static-pages", icon: "📄" },
    { name: "Kategori & Tag", path: "/dashboard/tags", icon: "🏷️" },
    { name: "Jadwal & Agenda", path: "/dashboard/agenda", icon: "🗓️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-[family-name:var(--font-geist-sans)]">
      
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl mr-2">🕌</span>
          <span className="font-bold text-gray-800 tracking-wide">Mosque SaaS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Menu Takmir
          </p>
          
          {menuItems.map((item) => {
            const isActive =
              item.path === "/dashboard" ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <a 
            href="/logout" 
            className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <span>🚪</span> Keluar
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-0">
          <div className="md:hidden flex items-center gap-2">
            <span className="text-2xl">🕌</span>
            <span className="font-bold text-gray-800">Mosque SaaS</span>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Panel Pengelola</span>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
