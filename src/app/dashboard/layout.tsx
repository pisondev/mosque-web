"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// --- Kumpulan Ikon SVG Monokrom ---
const Icons = {
  Logo: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8m0 0V3a2 2 0 00-2-2H8a2 2 0 00-2 2v10m6-10a2 2 0 012 2v10m-8 8h10a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" /></svg>,
  MenuToggle: ({ isOpen }: { isOpen: boolean }) => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>,
  Home: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  Building: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  Users: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Calendar: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
  Megaphone: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-1.598.92c-.536.308-1.222.116-1.527-.428A18.212 18.212 0 012.25 12c0-1.78.334-3.483.94-5.068.305-.544.991-.736 1.527-.428l1.598.92c.523.302.71 1.053.463 1.512a13.88 13.88 0 00-.985 2.782m0 9.18a20.06 20.06 0 005.132.895 20.06 20.06 0 005.132-.895m0-9.18c.688.06 1.386.09 2.09.09h.75a4.5 4.5 0 100-9h-.75c-.704 0-1.402.03-2.09.09m0 9.18c-.253.962-.584 1.892-.985 2.783-.247.55-.06 1.21.463 1.511l1.598.92c.536.308 1.222.116 1.527-.428A18.212 18.212 0 0021.75 12c0-1.78-.334-3.483-.94-5.068-.305-.544-.991-.736-1.527-.428l-1.598.92c-.523.302-.71 1.053-.463 1.512a13.88 13.88 0 01.985 2.782" /></svg>,
  DocumentText: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  Document: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>,
  Photo: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  Tag: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>,
  Globe: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  Logout: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Struktur Menu yang Dikelompokkan ---
  const menuGroups = [
    {
      title: "Dasbor & Profil",
      items: [
        { name: "Ikhtisar", path: "/dashboard", icon: <Icons.Home /> },
        { name: "Profil Masjid", path: "/dashboard/profile", icon: <Icons.Building /> },
        { name: "Susunan Pengurus", path: "/dashboard/management", icon: <Icons.Users /> },
      ]
    },
    {
      title: "Ibadah & Kegiatan",
      items: [
        { name: "Jadwal & Agenda", path: "/dashboard/agenda", icon: <Icons.Calendar /> },
        { name: "Manajemen Event", path: "/dashboard/events", icon: <Icons.Megaphone /> },
      ]
    },
    {
      title: "Konten & Media",
      items: [
        { name: "Artikel & Berita", path: "/dashboard/content", icon: <Icons.DocumentText /> },
        { name: "Halaman Statis", path: "/dashboard/static-pages", icon: <Icons.Document /> },
        { name: "Kategori & Tag", path: "/dashboard/tags", icon: <Icons.Tag /> },
        { name: "Galeri & Dokumentasi", path: "/dashboard/gallery", icon: <Icons.Photo /> },
      ]
    },
    {
      title: "Sistem & Akses",
      items: [
        { name: "Pengaturan Domain", path: "/dashboard/domains", icon: <Icons.Globe /> },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-[family-name:var(--font-geist-sans)]">
      
      {/* SIDEBAR (Desktop) */}
      <aside 
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-20 transition-all duration-300 ease-in-out relative`}
      >
        {/* Tombol Toggle Collapse */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-5 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 rounded-full p-1 shadow-sm transition-colors z-30"
          title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
        >
          <Icons.MenuToggle isOpen={isSidebarOpen} />
        </button>

        {/* Header Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-center w-10">
            <Icons.Logo />
          </div>
          <span className={`font-bold text-gray-800 tracking-wide ml-3 whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
            eTAKMIR ADMIN
          </span>
        </div>
        
        {/* Area Navigasi */}
        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6">
              {/* Judul Grup */}
              <div className={`px-4 mb-2 min-h-[1.5rem] flex items-center ${!isSidebarOpen && "justify-center"}`}>
                {isSidebarOpen ? (
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate">
                    {group.title}
                  </p>
                ) : (
                  <div className="w-6 h-px bg-gray-200 rounded-full"></div>
                )}
              </div>
              
              {/* Item Menu */}
              <div className="space-y-1 px-3">
                {group.items.map((item) => {
                  const isActive = item.path === "/dashboard" ? pathname === item.path : pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      title={!isSidebarOpen ? item.name : undefined} // Tooltip muncul jika ditutup
                      className={`flex items-center rounded-lg font-medium transition-all duration-200 overflow-hidden ${
                        isActive 
                          ? "bg-blue-50 text-blue-700" 
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      } ${isSidebarOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}`}
                    >
                      <div className={`flex-shrink-0 ${isSidebarOpen ? "mr-3" : "mr-0"}`}>
                        {item.icon}
                      </div>
                      <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Area Logout */}
        <div className="p-3 border-t border-gray-100">
          <a 
            href="/logout" 
            title={!isSidebarOpen ? "Keluar Sistem" : undefined}
            className={`flex items-center text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors overflow-hidden ${isSidebarOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}`}
          >
            <div className={`flex-shrink-0 ${isSidebarOpen ? "mr-3" : "mr-0"}`}>
              <Icons.Logout />
            </div>
            <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
              Keluar Sistem
            </span>
          </a>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
          {/* Header Mobile (Tetap ada jika dibuka dari HP) */}
          <div className="md:hidden flex items-center gap-2">
            <Icons.Logo />
            <span className="font-bold text-gray-800">eTAKMIR ADMIN</span>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Panel Pengelola</span>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
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