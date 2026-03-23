"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (value: string) => void; // <--- Tambahan prop onChange
}

export default function CustomSelect({ options, name, defaultValue, disabled, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || options[0]?.value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === selected)?.label;

  return (
    <div className="relative w-full" ref={ref}>
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 flex justify-between items-center rounded-lg border text-sm focus:outline-none transition-all duration-200 ${
          disabled 
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
            : isOpen 
              ? "border-emerald-500 ring-2 ring-emerald-100 bg-white text-gray-900 shadow-sm" 
              : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <ul className="max-h-60 overflow-y-auto py-1.5 scrollbar-thin scrollbar-thumb-gray-200">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(opt.value);
                    setIsOpen(false);
                    if (onChange) onChange(opt.value); // <--- Kirim data ke luar jika ada perubahan
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                    selected === opt.value ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                  {selected === opt.value && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}