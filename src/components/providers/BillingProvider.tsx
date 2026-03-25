"use client";

import { createContext, useContext, ReactNode } from "react";

// Mendefinisikan struktur tipe data berdasarkan kontrak Backend
export interface BillingData {
  subscription_plan: string;
  active_template: string;
  storage: {
    limit_mb: number;
    used_mb: number;
  };
  features_unlocked: string[];
  attribution_enabled: boolean;
  platform_fee_percentage: number;
}

// Nilai default (Fallback) jika data gagal dimuat (Diasumsikan FREE)
const defaultBillingData: BillingData = {
  subscription_plan: "free",
  active_template: "template_default",
  storage: { limit_mb: 0, used_mb: 0 },
  features_unlocked: ["profile"], // Hanya profil yang terbuka secara default untuk keamanan
  attribution_enabled: true,
  platform_fee_percentage: 0,
};

// Membuat Context
const BillingContext = createContext<BillingData>(defaultBillingData);

// Provider Component untuk membungkus Layout Dasbor
export default function BillingProvider({ 
  children, 
  initialData 
}: { 
  children: ReactNode; 
  initialData?: BillingData 
}) {
  return (
    <BillingContext.Provider value={initialData || defaultBillingData}>
      {children}
    </BillingContext.Provider>
  );
}

// Custom Hook agar sangat mudah dipanggil di komponen klien (seperti Sidebar)
export function useBilling() {
  return useContext(BillingContext);
}