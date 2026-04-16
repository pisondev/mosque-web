import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingView from "@/components/dashboard/OnBoardingView";
import { getSubscriptionPlansAction } from "../actions/subscription";

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
  } catch {
    return null;
  }
}

export default async function SetupPage() {
  const [tenantJson, plansJson] = await Promise.all([
    checkTenantStatus(),
    getSubscriptionPlansAction(),
  ]);

  if (!tenantJson) {
    redirect("/logout");
  }

  const { onboarding_completed, onboarding_payment_status } = tenantJson.data;
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
           accountEmail={tenantJson.data.email || "Akun tidak diketahui"}
           accountName={tenantJson.data.name || ""}
         />
      </div>
    </div>
  );
}
