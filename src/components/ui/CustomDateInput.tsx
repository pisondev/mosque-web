"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface CustomDateInputProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CustomDateInput({ name, defaultValue, required, disabled }: CustomDateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Inisialisasi State Tanggal
  const initialDate = defaultValue ? new Date(defaultValue) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultValue ? initialDate : null);
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());

  // Handle Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Kalkulasi Grid Kalender
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } 
    else { setViewMonth(viewMonth - 1); }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } 
    else { setViewMonth(viewMonth + 1); }
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    // Atur timezone offset agar tidak meleset saat diubah ke ISO string
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
    setSelectedDate(newDate);
    setIsOpen(false);
  };

  // Format YYYY-MM-DD untuk backend (Hidden Input)
  const formattedValue = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
  // Format DD Month YYYY untuk tampilan
  const displayValue = selectedDate ? `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` : "Pilih Tanggal";

  return (
    <div className="relative w-full" ref={ref}>
      <input type="hidden" name={name} value={formattedValue} required={required} />
      
      {/* Tombol Input Palsu */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-10 pr-4 py-2.5 min-h-[42px] flex items-center justify-between rounded-lg border text-sm focus:outline-none transition-all duration-200 ${
          disabled ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
          : isOpen ? "border-emerald-500 ring-2 ring-emerald-100 bg-white text-gray-900 shadow-sm" 
          : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
        }`}
      >
        <CalendarIcon className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <span className={!selectedDate ? "text-gray-400" : ""}>{displayValue}</span>
      </button>

      {/* Popup Kalender Kustom */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1.5 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-4">
          {/* Header Kalender */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <p className="font-bold text-gray-800 text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</p>
            <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>

          {/* Grid Nama Hari */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>)}
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 gap-1">
            {emptyCells.map(e => <div key={`empty-${e}`} />)}
            {daysArray.map(day => {
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === viewMonth && selectedDate?.getFullYear() === viewYear;
              const isToday = new Date().getDate() === day && new Date().getMonth() === viewMonth && new Date().getFullYear() === viewYear;
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm transition-colors ${
                    isSelected ? "bg-emerald-600 text-white font-bold shadow-md" 
                    : isToday ? "text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-100" 
                    : "text-gray-700 hover:bg-gray-100 font-medium"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}