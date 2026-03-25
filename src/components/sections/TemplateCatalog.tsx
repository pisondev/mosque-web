"use client";
import { motion } from "framer-motion";
import { Palette } from "lucide-react";

export default function TemplateCatalog() {
  const templates = [
    { title: "Minimalis Zamrud", desc: "Desain bawaan yang bersih.", type: "FREE", img: "https://images.unsplash.com/photo-1590013330462-6780c6145890?q=80&w=600", bg: "bg-gray-100" },
    { title: "Elegan Gelap", desc: "Nuansa eksklusif.", type: "PREMIUM+", bg: "bg-gray-900 text-white" },
    { title: "Komunitas Aktif", desc: "Fokus visibilitas event.", type: "PRO++", bg: "bg-emerald-50" },
  ];

  return (
    <section id="template" className="mx-auto max-w-[1440px] py-24 px-6 lg:px-12 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="mb-4 text-3xl font-black">Wajah Digital yang Memukau Jamaah</h2>
        <p className="mx-auto mb-12 max-w-2xl font-medium text-gray-600">
          Pilih dari berbagai desain website premium yang langsung terhubung dengan data di dasbor Anda (Profil, Kegiatan, hingga Artikel).
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: i * 0.2 }}
            className="group overflow-hidden rounded-2xl border border-gray-200 shadow-sm text-left"
          >
            <div className={`relative h-48 overflow-hidden flex items-center justify-center ${tpl.bg}`}>
              {tpl.img ? (
                <img src={tpl.img} alt={tpl.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <Palette className="h-12 w-12 opacity-20 transition-transform duration-500 group-hover:scale-110" />
              )}
              <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-900 shadow-sm">{tpl.type}</div>
            </div>
            <div className="bg-white p-5">
              <h4 className="text-lg font-bold text-gray-900">{tpl.title}</h4>
              <p className="mt-1 text-sm text-gray-500">{tpl.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}