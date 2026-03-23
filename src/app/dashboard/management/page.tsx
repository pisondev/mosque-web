import { listManagementMembers } from "../../actions/community";
import ManagementManager from "./ManagementManager";

export default async function ManagementPage() {
  const membersRes = await listManagementMembers(1, 100);
  const members = Array.isArray(membersRes?.data) ? membersRes.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-800">Susunan Pengurus Masjid</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelola daftar takmir, penasihat, dan divisi pengurus untuk ditampilkan di halaman publik.
        </p>
      </div>

      <ManagementManager initialMembers={members} />
    </div>
  );
}