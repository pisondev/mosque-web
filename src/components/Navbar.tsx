"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";
import { createSession } from "../app/actions/auth";

export default function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      // 1. Ambil Base URL dari environment, fallback ke localhost jika kosong
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      const res = await axios.post(`${baseUrl}/api/v1/auth/google`, {
        token: credentialResponse.credential,
      });
      
      // 2. Simpan session token ke cookie
      await createSession(res.data.access_token);
      
    } catch (error: any) {
      if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
        throw error; // Biarkan Next.js yang menangani redirect bawaannya
      }
      
      console.error("Login gagal", error);
      setIsLoading(false);
      alert("Gagal masuk. Silakan coba lagi.");
    }
  };

  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-transparent py-6 px-8 flex justify-between items-center">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2">
        <span className="text-3xl">🕌</span>
        <span className="text-white font-bold text-xl tracking-wide drop-shadow-md">
          Mosque SaaS
        </span>
      </div>

      {/* Menu & Auth */}
      <div className="flex items-center gap-8">
        <a href="#fitur" className="text-white font-medium hover:text-gray-200 drop-shadow-md transition">Fitur</a>
        <a href="/pricing" className="text-white font-medium hover:text-gray-200 drop-shadow-md transition">Paket</a>
        
        <div className="border-l border-white/30 h-6 mx-2"></div>

        {isLoading ? (
          <span className="text-white font-medium drop-shadow-md animate-pulse">Memverifikasi...</span>
        ) : isLoggedIn ? (
          <div className="flex items-center gap-4">
            <a 
              href="/dashboard" 
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2 rounded-full font-semibold transition border border-white/50"
            >
              Ke Dashboard
            </a>
            <a 
              href="/logout" 
              className="text-white/80 hover:text-white text-sm drop-shadow-md transition"
            >
              Logout
            </a>
          </div>
        ) : (
          <div className="scale-95 origin-right">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google Login Failed")}
              theme="outline"
              shape="pill"
            />
          </div>
        )}
      </div>
    </nav>
  );
}