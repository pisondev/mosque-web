import BillingProvider from "../../components/providers/BillingProvider";
import { getAccountProfileAction } from "../actions/account";
import { getBillingStatus } from "../actions/tenant";
import DashboardLayoutClient from "../../components/dashboard/DashboardLayoutClient";
import { ToastProvider } from "../../components/ui/Toast";
import { DecisionModalProvider } from "../../components/ui/DecisionModalProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [response, accountResponse] = await Promise.all([
    getBillingStatus(),
    getAccountProfileAction(),
  ]);
  const billingData = response?.data;
  const accountData = accountResponse?.data || undefined;

  return (
    <BillingProvider initialData={billingData}>
      <ToastProvider>
        <DecisionModalProvider>
          {/* Memanggil tampilan UI yang sudah dikembalikan ke CSS lamamu */}
          <DashboardLayoutClient account={accountData}>
            {children}
          </DashboardLayoutClient>
        </DecisionModalProvider>
      </ToastProvider>
    </BillingProvider>
  );
}
