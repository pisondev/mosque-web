"use client";

import { useState, useEffect } from "react";
import { Menu, X, Hexagon } from "lucide-react";
import Link from "next/link";

export default function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ["fitur", "template", "harga"];
      let current = "";
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Offset untuk mendeteksi section yang sedang di layar
          if (rect.top <= 200 && rect.bottom >= 200) {
            current = id;
          }
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
    }
  };

  const navLinks = [
    { name: "Fitur Dasbor", id: "fitur" },
    { name: "Katalog Website", id: "template" },
    { name: "Paket & Harga", id: "harga" },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm py-4" : "bg-white py-6"}`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">        
        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 group">
          <Hexagon className="w-8 h-8 text-emerald-600 fill-emerald-50 group-hover:scale-105 transition-transform" />
          <span className="font-bold tracking-wide text-xl text-gray-900">
            <span className="text-yellow-500">e</span>TAKMIR
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.id}
              href={`#${link.id}`} 
              onClick={(e) => scrollToSection(e, link.id)}
              className={`text-sm font-semibold transition-colors ${
                activeSection === link.id ? "text-emerald-600" : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              {link.name}
            </a>
          ))}
          
          <div className="border-l border-gray-300 h-5 mx-2"></div>

          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/logout" prefetch={false} className="text-sm font-bold text-gray-500 hover:text-rose-600 transition-colors">Logout</Link>
              <Link href="/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95">
                Masuk Dasbor
              </Link>
            </div>
          ) : (
            <Link href="/auth" className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md shadow-gray-900/20 active:scale-95">
              Masuk
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl flex flex-col p-6 gap-4 md:hidden animate-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <a 
              key={link.id}
              href={`#${link.id}`} 
              onClick={(e) => scrollToSection(e, link.id)} 
              className={`text-base font-semibold border-b border-gray-100 pb-2 ${
                activeSection === link.id ? "text-emerald-600" : "text-gray-800"
              }`}
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="bg-emerald-600 text-white text-center px-5 py-3 rounded-xl font-bold">Masuk Dasbor</Link>
                <Link href="/logout" prefetch={false} className="text-center font-bold text-gray-500 py-2">Logout</Link>
              </>
            ) : (
              <Link href="/auth" className="bg-gray-900 text-white text-center px-5 py-3 rounded-xl font-bold">
                Masuk
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
