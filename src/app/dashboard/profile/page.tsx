import { redirect } from "next/navigation";
import { getProfileFormData } from "../../actions/profile";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const profile = await getProfileFormData();

  if (profile.error || !profile.data) {
    redirect("/logout");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profil Masjid</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelola identitas resmi masjid yang akan dipakai lintas modul website.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <ProfileForm initialData={profile.data} />
      </div>
    </div>
  );
}
