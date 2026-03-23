"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, LogOut, ChevronDown, Hexagon } from "lucide-react";
import { FLAT_MENU } from "./NavigationData";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMenu = FLAT_MENU.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm sticky top-0 z-30">
      
      {/* Header Mobile: Sinkron dengan logo Sidebar */}
      <div className="md:hidden flex items-center overflow-hidden focus:outline-none">
        <Hexagon className="w-6 h-6 text-emerald-600 fill-emerald-50 flex-shrink-0" />
        <span className="font-bold tracking-wide ml-2 whitespace-nowrap text-sm">
          <span className="text-yellow-500">e</span>
          <span className="text-emerald-800">TAKMIR</span> 
          <span className="text-gray-900 font-black ml-1">ADMIN</span>
        </span>
      </div>
      
      {/* Fitur Search Global */}
      <div className="hidden md:flex flex-1 items-center max-w-md relative" ref={searchRef}>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari menu navigasi..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 hover:bg-gray-200 border border-transparent focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 rounded-lg text-sm text-gray-900 transition-all outline-none"
          />
        </div>

        {/* Hasil Pencarian */}
        {isSearchOpen && searchQuery && (
          <div className="absolute top-10 left-0 w-full bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-50 max-h-64 overflow-y-auto">
            {filteredMenu.length > 0 ? (
              filteredMenu.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(item.path);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm text-gray-700 flex items-center gap-3 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-gray-400" />
                  {item.name}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500 text-center">Menu tidak ditemukan.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 md:hidden"></div>
      
      {/* Area Profil User */}
      <div className="flex items-center gap-4 relative" ref={profileRef}>
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-gray-200 focus:outline-none"
        >
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-gray-700">Pison Golda Mountera</span>
            <span className="text-[10px] text-gray-500">pison.gm.dev@gmail.com</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
            P
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
        </button>

        {/* Dropdown Profil */}
        {isProfileOpen && (
          <div className="absolute top-12 right-0 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
              <p className="text-xs font-semibold text-gray-700 truncate">pison.gm.dev@gmail.com</p>
            </div>
            <a href="/logout" className="flex items-center gap-2 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 font-medium transition-colors">
              <LogOut className="w-4 h-4" /> Keluar
            </a>
          </div>
        )}
      </div>
    </header>
  );
}