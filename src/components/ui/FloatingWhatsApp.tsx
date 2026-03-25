"use client";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  const waNumber = "+6285647572502"; // Ganti nomormu
  const message = "Halo,%20Assalamu'alaikum.%20Saya%20ingin%20bertanya%20seputar%20sistem%20eTAKMIR.";

  return (
    <a
      href={`https://wa.me/${waNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-emerald-600 hover:shadow-emerald-500/40"
      aria-label="Hubungi via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}