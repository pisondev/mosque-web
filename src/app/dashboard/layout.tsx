import BillingProvider from "../../components/providers/BillingProvider";
import { getBillingStatus } from "../actions/tenant";
import DashboardLayoutClient from "../../components/dashboard/DashboardLayoutClient";
import { ToastProvider } from "../../components/ui/Toast";
import { DecisionModalProvider } from "../../components/ui/DecisionModalProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ambil data status langganan SaaS dari Backend secara Server-Side
  const response = await getBillingStatus();
  const billingData = response?.data;

  return (
    <BillingProvider initialData={billingData}>
      <ToastProvider>
        <DecisionModalProvider>
          {/* Memanggil tampilan UI yang sudah dikembalikan ke CSS lamamu */}
          <DashboardLayoutClient>
            {children}
          </DashboardLayoutClient>
        </DecisionModalProvider>
      </ToastProvider>
    </BillingProvider>
  );
}
