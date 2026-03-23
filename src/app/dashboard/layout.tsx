"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar"; 
import Header from "@/components/dashboard/Header";
import { ToastProvider } from "@/components/ui/Toast"; // <--- TAMBAHKAN IMPORT INI

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    // BUNGKUS DENGAN ToastProvider DI SINI
    <ToastProvider>
      <div className="h-screen w-full bg-gray-50 flex font-[family-name:var(--font-geist-sans)] overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}