"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { useToast } from "./Toast";

// Komponen 1: Salin ke Clipboard
export function CopyToClipboard({ text, display }: { text: string, display?: string }) {
  const { addToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    addToast("Berhasil disalin ke papan klip!", "success");
  };

  return (
    <button type="button" onClick={handleCopy} className="group flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors focus:outline-none text-left">
      {display || text}
      <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
    </button>
  );
}

// Komponen 2: Dialog Buka Link Eksternal
export function ConfirmRedirect({ url, display }: { url: string, display: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const resolvedDisplay = useMemo(() => {
    if (display && display.trim() !== "") {
      return display;
    }
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }, [display, url]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <span
        suppressHydrationWarning
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200"
      >
        {resolvedDisplay}
      </span>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} suppressHydrationWarning className="group flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors focus:outline-none bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 hover:border-emerald-200">
        {resolvedDisplay}
        <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Buka Halaman Publik?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Anda akan dialihkan ke tab baru menuju:<br/>
                <span className="font-semibold text-gray-700 mt-1 block break-all">{url}</span>
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
              <a href={url} target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm">
                Lanjutkan Buka
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
