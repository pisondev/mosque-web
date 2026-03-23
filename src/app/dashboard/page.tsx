import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import OnboardingForm from "../../components/OnboardingForm";

async function getTenantProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;
  if (!token) return null;

  try {
    const res = await fetch("http://localhost:8080/api/v1/tenant/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function DashboardPage() {
  const profile = await getTenantProfile();

  if (!profile || profile.status !== "success") {
    redirect("/logout");
  }

  const { name, subdomain, status } = profile.data;

  const isNeedsSetup = name === "Toko Baru" || status === "pending";

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-3xl">
        {isNeedsSetup ? (
          <div className="max-w-md mx-auto py-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4 text-2xl">
                🕌
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Selamat Datang!</h2>
              <p className="text-gray-500 mt-2 text-sm">
                Sebelum memulai, mari lengkapi identitas dasar masjid Anda terlebih dahulu.
              </p>
            </div>

            <OnboardingForm />
          </div>
        ) : (
          <div>
            <div className="border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Utama</h2>
              <p className="text-gray-500 text-sm">Pusat kendali informasi {name}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 flex flex-col justify-center">
                <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Nama Masjid</h3>
                <p className="text-gray-800 font-bold text-lg">{name}</p>
              </div>
              
              <div className="p-5 bg-green-50 rounded-xl border border-green-100 flex flex-col justify-center">
                <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-1">Akses Website Publik</h3>
                <a href={`https://${subdomain}.mosquesaas.com`} target="_blank" className="text-green-700 font-medium hover:underline mt-1">
                  {subdomain}.mosquesaas.com ↗
                </a>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { name: "Profil Masjid", href: "/dashboard/profile" },
                { name: "Domain & Akses", href: "/dashboard/domains" },
                { name: "Artikel", href: "/dashboard/content" },
                { name: "Halaman Statis", href: "/dashboard/static-pages" },
                { name: "Kategori & Tag", href: "/dashboard/tags" },
                { name: "Jadwal & Agenda", href: "/dashboard/agenda" },
              ].map((menu) => (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm font-medium text-gray-700">{menu.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
