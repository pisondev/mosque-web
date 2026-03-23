"use client";

import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface CustomTimeInputProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function CustomTimeInput({ name, defaultValue, required, disabled }: CustomTimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse defaultValue ("HH:mm")
  const defaultHour = defaultValue ? defaultValue.split(":")[0] : "12";
  const defaultMin = defaultValue ? defaultValue.split(":")[1] : "00";

  const [selectedHour, setSelectedHour] = useState(defaultHour);
  const [selectedMinute, setSelectedMinute] = useState(defaultMin);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  const formattedTime = `${selectedHour}:${selectedMinute}`;

  return (
    <div className="relative w-full" ref={ref}>
      {/* Hidden input agar terbaca oleh FormData di parent */}
      <input type="hidden" name={name} value={formattedTime} required={required} />
      
      {/* Tombol Input Palsu */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-10 pr-4 py-2.5 min-h-[42px] flex items-center justify-between rounded-lg border text-sm font-medium tracking-wider focus:outline-none transition-all duration-200 ${
          disabled ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
          : isOpen ? "border-emerald-500 ring-2 ring-emerald-100 bg-white text-gray-900 shadow-sm" 
          : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
        }`}
      >
        <Clock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <span>{formattedTime}</span>
      </button>

      {/* Popup Pemilih Waktu Kustom */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1.5 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-2 flex gap-2">
          
          {/* Kolom Jam */}
          <div className="flex-1 flex flex-col h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase text-center mb-1 sticky top-0 bg-white py-1">Jam</span>
            {hours.map(h => (
              <button
                key={`h-${h}`}
                type="button"
                onClick={() => setSelectedHour(h)}
                className={`py-2 text-sm rounded-lg transition-colors text-center ${selectedHour === h ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Kolom Menit */}
          <div className="flex-1 flex flex-col h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pl-1 border-l border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase text-center mb-1 sticky top-0 bg-white py-1">Menit</span>
            {minutes.map(m => (
              <button
                key={`m-${m}`}
                type="button"
                onClick={() => setSelectedMinute(m)}
                className={`py-2 text-sm rounded-lg transition-colors text-center ${selectedMinute === m ? "bg-emerald-600 text-white font-bold shadow-sm" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {m}
              </button>
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
}