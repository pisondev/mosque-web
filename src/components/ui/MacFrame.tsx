"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function MacFrame() {
  const images = [
    "/landing/1_ikhtisar.png",
    "/landing/2_profile.png",
    "/landing/3_paket.png",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-emerald-900/10">
      {/* Top Bar Mac */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3 backdrop-blur-sm">
        <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
        <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
        <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-sm"></div>
      </div>
      
      {/* Content Area (Rasio 3:2). Diganti ke bg-gray-50 agar menyatu kalau gambar kurang panjang */}
      <div className="relative aspect-[3/2] w-full bg-gray-50">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Tampilan Dasbor eTAKMIR ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            // object-contain memastikan gambar fit ke dalam layar tanpa ada bagian yang terzoom/terpotong
            className={`object-contain object-center transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            priority={index === 0}
          />
        ))}
      </div>
    </div>
  );
}