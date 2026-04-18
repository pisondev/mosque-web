import { redirect } from "next/navigation";
import { UserRound } from "lucide-react";
import { getAccountProfileAction } from "@/app/actions/account";
import AccountProfileForm from "./AccountProfileForm";

export default async function AccountPage() {
  const account = await getAccountProfileAction();

  if (account.error || !account.data) {
    redirect("/logout");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
          <UserRound className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Setup Profile</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola identitas akun admin yang tampil di header dashboard dan sesi login.</p>
        </div>
      </div>

      <AccountProfileForm initialData={account.data} />
    </div>
  );
}
