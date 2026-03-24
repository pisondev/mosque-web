import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingView from "@/components/dashboard/OnBoardingView";

export const dynamic = "force-dynamic";

async function checkTenantStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;
  if (!token) return null;

  try {
    const baseUrl = process.env.API_INTERNAL_URL || "http://localhost:8080";
    const res = await fetch(`${baseUrl}/api/v1/tenant/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function SetupPage() {
  const tenantJson = await checkTenantStatus();

  if (!tenantJson) {
    redirect("/logout");
  }

  const { name, status } = tenantJson.data;
  const isNeedsSetup = name === "Toko Baru" || status === "pending";

  if (!isNeedsSetup) {
    // Jika sudah setup tapi iseng buka /setup, tendang balik ke dashboard
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
         <OnboardingView />
      </div>
    </div>
  );
}