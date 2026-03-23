"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar"; // Sesuaikan path alias jika berbeda (misal: "../../components/dashboard/Sidebar")
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    // Wrapper Utama: h-screen dan overflow-hidden mengunci layar agar tidak scroll utuh
    <div className="h-screen w-full bg-gray-50 flex font-[family-name:var(--font-geist-sans)] overflow-hidden">
      
      {/* Sidebar mengurus scroll vertical-nya sendiri */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Kontainer Kanan */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header />
        
        {/* Main Content Area: Bisa di-scroll secara mandiri */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>

    </div>
  );
}