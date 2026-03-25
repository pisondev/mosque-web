"use client";
import { ArrowRight } from "lucide-react";

export default function HeroCTA() {
  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("harga");
    if (element) {
      const offset = 80; // Sesuaikan dengan tinggi navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
    }
  };

  return (
    <a 
      href="#harga" 
      onClick={scrollToPricing}
      className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-xl shadow-gray-900/20 flex items-center justify-center gap-2"
    >
      Mulai Gratis Sekarang <ArrowRight className="w-4 h-4" />
    </a>
  );
}