"use client";

import { X, Lock, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export default function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Dekoratif */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <button onClick={onClose} className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/30 shadow-inner">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Fitur Terkunci</h3>
        </div>

        {/* Konten Utama */}
        <div className="p-6 text-center space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Menu <strong className="text-gray-900">"{featureName}"</strong> tidak tersedia pada paket langganan Anda saat ini.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-left">
            <Crown className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Tingkatkan Layanan Masjid</h4>
              <p className="text-xs text-amber-700 mt-1">Buka semua fitur eksklusif eTAKMIR untuk memaksimalkan pengelolaan kegiatan dan donasi jamaah.</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link 
              href="/dashboard/templates" // Nanti kita arahkan ke halaman pilih paket/template
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              Lihat Paket & Upgrade <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={onClose} className="w-full text-gray-500 hover:text-gray-700 font-medium py-2.5 text-sm transition-colors">
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}