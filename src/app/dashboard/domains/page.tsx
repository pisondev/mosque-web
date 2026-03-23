import { getDomains } from "../../actions/domains";
import { CreateDomainForm, DeleteDomainButton, DomainStatusControl } from "./DomainComponents";

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
    <div className="max-w-6xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Domain & Akses</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelola subdomain dan custom domain agar website masjid bisa diakses publik.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tambah Domain</h3>
            <CreateDomainForm />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 font-semibold">Hostname</th>
                    <th className="p-4 font-semibold">Jenis</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Verifikasi</th>
                    <th className="p-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {domains.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        Belum ada domain yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    domains.map((domain) => (
                      <tr key={domain.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{domain.hostname}</td>
                        <td className="p-4 text-gray-600">{domain.domain_type}</td>
                        <td className="p-4">
                          <DomainStatusControl id={domain.id} currentStatus={domain.status} />
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {domain.verified_at ? "Terverifikasi" : "Belum"}
                        </td>
                        <td className="p-4 text-right">
                          <DeleteDomainButton id={domain.id} />
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
