import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingView from "@/components/dashboard/OnBoardingView";
import { getServerApiOrigin } from "@/lib/server-api";
import { getSubscriptionPlansAction } from "../actions/subscription";

export const dynamic = "force-dynamic";

async function checkTenantStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;
  if (!token) return { unauthorized: true as const, data: null, error: null };

  try {
    const baseUrl = getServerApiOrigin();
    const res = await fetch(`${baseUrl}/api/v1/tenant/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      return { unauthorized: true as const, data: null, error: "Sesi tidak valid atau telah berakhir." };
    }
    if (!res.ok) return { unauthorized: false as const, data: null, error: "Gagal memuat status tenant." };
    const json = await res.json();
    return { unauthorized: false as const, data: json.data, error: null };
  } catch {
    return { unauthorized: false as const, data: null, error: "Terjadi kesalahan jaringan saat memuat setup." };
  }
}

export default async function SetupPage() {
  const [tenantJson, plansJson] = await Promise.all([
    checkTenantStatus(),
    getSubscriptionPlansAction(),
  ]);

  if (tenantJson.unauthorized) {
    redirect("/auth?mode=login");
  }

  if (!tenantJson.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h2 className="text-xl font-bold mb-2">Halaman setup belum bisa dimuat</h2>
          <p className="text-sm">{tenantJson.error || "Data tenant belum tersedia."}</p>
        </div>
      </div>
    );
  }

  const { onboarding_completed, onboarding_payment_status, email, name } = tenantJson.data;
  const isNeedsSetup = !onboarding_completed;

  if (!isNeedsSetup) {
    redirect("/dashboard");
  }

  const plans = plansJson?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
         <OnboardingView
           plans={plans}
           initialPaymentStatus={onboarding_payment_status}
            accountEmail={email || "Akun tidak diketahui"}
            accountName={name || ""}
          />
      </div>
    </div>
  );
}
