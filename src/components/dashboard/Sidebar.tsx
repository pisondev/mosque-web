"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { PanelLeftClose, ChevronRight, LogOut, Hexagon, Lock } from "lucide-react";
import { MENU_DATA } from "./NavigationData";
import { useBilling } from "../providers/BillingProvider";
import UpgradeModal from "./UpgradeModal";

export default function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (val: boolean) => void 
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Membaca status langganan SaaS
  const { features_unlocked } = useBilling();

  const [openGroups, setOpenGroups] = useState<string[]>(["Dasbor & Profil"]);
  
  // State untuk kontrol Modal Upsell
  const [modalOpen, setModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState("");

  const toggleGroup = (title: string) => {
    if (!isOpen) setIsOpen(true);
    setOpenGroups(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const handleLinkClick = (e: React.MouseEvent, item: any, isLocked: boolean) => {
    if (isLocked) {
      e.preventDefault(); // Hentikan navigasi asli
      setLockedFeatureName(item.name);
      setModalOpen(true); // Munculkan modal
    }
  };

  return (
    <>
      <aside className={`${isOpen ? "w-64" : "w-16"} bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-20 transition-all duration-300 ease-in-out`}>
        
        {/* Header Sidebar */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-100 flex-shrink-0">
          <button onClick={() => !isOpen && setIsOpen(true)} className={`flex items-center overflow-hidden focus:outline-none ${!isOpen ? "cursor-pointer hover:scale-105 transition-transform" : "cursor-default"}`} title={!isOpen ? "Buka Sidebar" : undefined}>
            <Hexagon className="w-7 h-7 text-emerald-600 fill-emerald-50 flex-shrink-0" />
            <span className={`font-bold tracking-wide ml-2.5 whitespace-nowrap transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
              <span className="text-yellow-500">e</span><span className="text-emerald-800">TAKMIR</span><span className="text-gray-900 font-black ml-1">ADMIN</span>
            </span>
          </button>
          {isOpen && (
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100 flex-shrink-0 animate-in fade-in" title="Tutup Sidebar">
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Area Navigasi */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-200 transition-colors">
          <div className="space-y-1 px-2">
            {MENU_DATA.map((group) => {
              const isGroupOpen = openGroups.includes(group.title) && isOpen;
              const hasActiveChild = group.items.some(item => item.path === "/dashboard" ? pathname === item.path : pathname.startsWith(item.path));

              return (
                <div key={group.title} className="mb-2">
                  <button onClick={() => toggleGroup(group.title)} title={!isOpen ? group.title : undefined} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-semibold transition-colors ${hasActiveChild && !isGroupOpen ? "text-emerald-700 bg-emerald-50/70" : "text-gray-600 hover:bg-gray-100"}`}>
                    <div className="flex items-center">
                      <group.icon className="w-5 h-5 flex-shrink-0" strokeWidth={hasActiveChild ? 2.5 : 2} />
                      <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>{group.title}</span>
                    </div>
                    {isOpen && <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${isGroupOpen ? "rotate-90" : "rotate-0"}`} />}
                  </button>

                  <div className={`overflow-hidden transition-all duration-150 ease-in-out ${isGroupOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    <div className="space-y-1 pl-4 pr-2">
                      {group.items.map((item) => {
                        const isActive = item.path === "/dashboard" ? pathname === item.path : pathname.startsWith(item.path);
                        
                        // LOGIC PENGUNCIAN FITUR:
                        const isLocked = item.requiredFeature ? !features_unlocked.includes(item.requiredFeature) : false;

                        return (
                          <Link
                            key={item.name}
                            href={isLocked ? "#" : item.path}
                            onClick={(e) => handleLinkClick(e, item, isLocked)}
                            className={`flex items-center justify-between py-2 px-3 rounded-md text-[13px] font-medium transition-colors ${
                              isLocked 
                                ? "text-gray-400 hover:bg-gray-50 cursor-pointer" 
                                : isActive 
                                  ? "bg-emerald-50 text-emerald-700" 
                                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center min-w-0">
                              <item.icon className={`w-4 h-4 mr-2.5 flex-shrink-0 ${isLocked ? "opacity-50" : "opacity-75"}`} strokeWidth={isActive ? 2.5 : 2} />
                              <span className="truncate">{item.name}</span>
                            </div>
                            
                            {/* Munculkan Ikon Gembok Jika Terkunci */}
                            {isLocked && <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Area Logout */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0 bg-white">
          <a href="/logout" title={!isOpen ? "Keluar Sistem" : undefined} className={`flex items-center text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors overflow-hidden ${isOpen ? "px-2.5 py-2" : "px-0 py-2 justify-center"}`}>
            <LogOut className={`w-5 h-5 flex-shrink-0 ${isOpen ? "mr-3" : "mr-0"}`} />
            <span className={`text-sm whitespace-nowrap transition-all duration-200 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>Keluar Sistem</span>
          </a>
        </div>
      </aside>

      {/* Render Modal Upsell di luar Sidebar */}
      <UpgradeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        featureName={lockedFeatureName} 
      />
    </>
  );
}