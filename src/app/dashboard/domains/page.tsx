import { getDomains } from "../../actions/domains";
import { CreateDomainForm, DeleteDomainButton, DomainStatusControl } from "./DomainComponents";
import { Globe, ShieldCheck, Clock, Link as LinkIcon } from "lucide-react";

type DomainItem = {
  id: number;
  domain_type: string;
  hostname: string;
  status: string;
  verified_at?: string | null;
};

export default async function DomainsPage() {
  const res = await getDomains();
  const domains: DomainItem[] = Array.isArray(res?.data) ? res.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Halaman */}
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pengaturan Domain</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola alamat website (subdomain & custom domain) agar portal masjid dapat diakses publik.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Kolom Kiri: Form Tambah (Sticky) */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-emerald-600" /> Tambah Domain
            </h3>
            <CreateDomainForm />
          </div>
        </div>

        {/* Kolom Kanan: Tabel Data */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Daftar Domain Terdaftar</h3>
            </div>

            {/* pb-24 agar CustomSelect dropdown tidak terpotong tabel */}
            <div className="overflow-x-auto pb-24">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-white text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Hostname</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Jenis</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] w-36">Status</th>
                    <th className="px-5 py-3 font-semibold text-center uppercase tracking-wider text-[11px]">Verifikasi</th>
                    <th className="px-5 py-3 font-semibold text-right uppercase tracking-wider text-[11px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {domains.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex justify-center mb-3"><Globe className="w-10 h-10 text-gray-300" /></div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Belum ada domain</h3>
                        <p className="text-gray-500 text-sm">Daftarkan subdomain atau custom domain pertamamu.</p>
                      </td>
                    </tr>
                  ) : (
                    domains.map((domain) => (
                      <tr key={domain.id} className="hover:bg-emerald-50/30 transition-colors group h-16">
                        <td className="px-5 py-3">
                          <p className="font-bold text-emerald-700 font-mono tracking-tight">{domain.hostname}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md border shadow-sm
                            ${domain.domain_type === 'custom_domain' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}
                          >
                            {domain.domain_type === 'custom_domain' ? 'Custom Domain' : 'Subdomain'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {/* Interaktif: Dropdown Status */}
                          <div className="min-w-[140px]">
                            <DomainStatusControl id={domain.id} currentStatus={domain.status} hostname={domain.hostname} />
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {domain.verified_at ? (
                            <div className="inline-flex items-center justify-center p-1.5 bg-emerald-100 text-emerald-600 rounded-full" title={`Terverifikasi pada ${new Date(domain.verified_at).toLocaleDateString('id-ID')}`}>
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center p-1.5 bg-amber-100 text-amber-600 rounded-full" title="Menunggu Verifikasi DNS">
                              <Clock className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <DeleteDomainButton id={domain.id} hostname={domain.hostname} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}