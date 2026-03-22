"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("Menunggu login...");
  const [backendResponse, setBackendResponse] = useState<any>(null);

  // Fungsi ini dipanggil otomatis oleh Google jika login sukses
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setStatus("Token ID didapatkan dari Google! Mengirim ke Go Backend...");
    
    try {
      // Menembak API Go Fiber milik kita
      const res = await axios.post("http://localhost:8080/api/v1/auth/google", {
        token: credentialResponse.credential,
      });

      setStatus("Sukses! Backend berhasil memverifikasi token.");
      setBackendResponse(res.data);
    } catch (error: any) {
      setStatus("Gagal! Backend menolak token atau terjadi error.");
      setBackendResponse(error.response?.data || error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Mosque SaaS</h1>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Prototipe Integrasi Otentikasi Google ke Go Fiber
        </p>

        {/* Komponen Tombol Bawaan Google */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            setStatus("Google Login Dibatalkan / Gagal di sisi Frontend.");
          }}
          useOneTap // Akan memunculkan popup otomatis di pojok kanan atas
        />

        {/* Panel Log Status */}
        <div className="mt-8 w-full">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Status Alur:</h3>
          <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 p-3 rounded-lg">
            {status}
          </p>
        </div>

        {/* Panel Respons dari Backend Go Fiber */}
        {backendResponse && (
          <div className="mt-4 w-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Respons Go Fiber:</h3>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(backendResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}