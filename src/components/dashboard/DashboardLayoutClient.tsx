"use client";

import { useState } from "react";
import type { AccountProfileData } from "@/app/actions/account";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayoutClient({
  account,
  children,
}: {
  account?: AccountProfileData;
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    // Menggunakan persis struktur CSS dan Font lamamu
    <div className="h-screen w-full bg-gray-50 flex font-[family-name:var(--font-geist-sans)] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header account={account} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
