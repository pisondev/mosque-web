"use client";
import { motion } from "framer-motion";
import { CheckCircle2, PlusCircle } from "lucide-react";

// Teks dipersingkat dan dibuat akumulatif
const PRICING_TIERS = [
  { 
    name: "FREE", 
    price: "0", 
    period: "", 
    desc: "Sempurna untuk memulai digitalisasi masjid skala kecil.", 
    features: [
      "FREE Website (Sub Domain)", 
      "1 Premium Template", 
      "Setup Profile Masjid", 
      "With Attribution"
    ] 
  },
  { 
    name: "PREMIUM+", 
    price: "24.900", 
    period: "/bulan", 
    desc: "Cocok untuk masjid yang aktif melakukan syiar.", 
    features: [
      "Mencakup semua fitur FREE, ditambah:", 
      "Upgrade ke 3 Premium Templates", 
      "Setup Jadwal Ibadah", 
      "Setup Rekening/QRIS", 
      "Setup Fasilitas", 
      "No Attribution"
    ] 
  },
  { 
    name: "PRO++", 
    price: "79.900", 
    period: "/bulan", 
    isPopular: true, 
    desc: "Paket lengkap untuk manajemen takmir profesional.", 
    features: [
      "Mencakup semua fitur PREMIUM+, ditambah:", 
      "Upgrade ke 5 Premium Templates", 
      "Setup Susunan Pengurus", 
      "Setup Event / Kegiatan", 
      "Setup Artikel / Renungan", 
      "Galeri Media (500MB Storage)", 
      "Kanal Donasi Digital (Fee 0.5%)"
    ] 
  },
  { 
    name: "MAX+++", 
    price: "149.000", 
    period: "/bulan", 
    desc: "Otoritas penuh dengan domain sendiri.", 
    features: [
      "Mencakup semua fitur PRO++, ditambah:", 
      "FREE Custom Domain (.WEB.ID)", 
      "Template Premium (Customable)", 
      "Upgrade Galeri Media (1GB Storage)", 
      "Kanal Donasi Digital (Fee 0%)"
    ] 
  },
];

export default function Pricing({ isLoggedIn }: { isLoggedIn: boolean }) {
  const waNumber = "628XXXXXXXXXX"; // Sesuaikan nomormu

  return (
    <section id="harga" className="border-t-8 border-emerald-600 bg-gray-950 py-24 text-white">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-black">Investasi Berkah untuk Kemajuan Masjid</h2>
          <p className="font-medium text-gray-400">Transparan, tanpa biaya tersembunyi. Pilih skala layanan yang sesuai.</p>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PRICING_TIERS.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className={`relative flex h-full flex-col rounded-2xl bg-gray-900 p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20 ${
                tier.isPopular ? "border border-emerald-500 z-10 scale-100 xl:scale-105" : "border border-gray-800"
              }`}
            >
              {tier.isPopular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  Paling Direkomendasikan
                </div>
              )}
              
              <h3 className={`mb-2 text-lg font-black uppercase tracking-wider ${tier.isPopular ? "text-emerald-400" : "text-gray-300"}`}>{tier.name}</h3>
              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-3xl font-black">Rp {tier.price}</span>
                {tier.price !== "0" && <span className="text-sm font-medium text-gray-500">{tier.period}</span>}
              </div>
              <p className="mb-6 min-h-[40px] text-xs text-gray-400">{tier.desc}</p>
              
              <div className="mb-6 flex-1 space-y-3">
                {tier.features.map((feat, i) => {
                  const isCumulativeText = feat.startsWith("Mencakup");
                  return (
                    <div key={i} className={`flex items-start gap-2 ${isCumulativeText ? "pb-2 border-b border-gray-800" : ""}`}>
                      {isCumulativeText ? (
                        <PlusCircle className={`mt-0.5 h-4 w-4 shrink-0 ${tier.isPopular ? "text-emerald-400" : "text-emerald-600"}`} />
                      ) : (
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${tier.isPopular ? "text-emerald-400" : "text-emerald-600"}`} />
                      )}
                      <span className={`text-[13px] leading-tight ${isCumulativeText ? "font-semibold text-emerald-300/90" : "text-gray-200"}`}>
                        {feat}
                      </span>
                    </div>
                  );
                })}
              </div>

              {!isLoggedIn ? (
                <a
                  href={`https://wa.me/${waNumber}?text=Halo,%20Assalamu'alaikum.%20Saya%20ingin%20berlangganan%20eTAKMIR%20Paket%20${encodeURIComponent(tier.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                    tier.isPopular 
                      ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                      : "border border-white/10 bg-white/10 text-white hover:border-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  Pilih {tier.name}
                </a>
              ) : (
                <div className="rounded-xl bg-emerald-950/50 py-3 text-center text-xs font-bold text-emerald-400">
                  Anda sudah Login
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}