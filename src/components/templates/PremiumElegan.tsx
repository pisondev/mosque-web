export default function PremiumElegan({ data }: { data: any }) {
  // Format Rupiah
  const formatRp = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 tracking-tighter leading-tight">
          {data.name}
        </h1>
        <p className="text-gray-300 text-xl font-light mb-10 leading-relaxed max-w-2xl mx-auto">
          Pusat peradaban umat yang modern, transparan, dan menginspirasi bagi lingkungan sekitar. (Tema: Premium Elegan)
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-emerald-400 font-bold mb-1 text-sm">Donasi Terkumpul</p>
            <p className="text-2xl font-black text-white">{formatRp(45500000)}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-cyan-400 font-bold mb-1 text-sm">Event Mendatang</p>
            <p className="text-2xl font-black text-white">Kajian Akbar</p>
          </div>
        </div>
      </div>
    </div>
  );
}