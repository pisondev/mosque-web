import { redirect } from "next/navigation";
import { getProfileFormData } from "../../actions/profile";
import ProfileForm from "./ProfileForm";
import { Building2 } from "lucide-react";

export default async function ProfilePage() {
  const profile = await getProfileFormData();

  if (profile.error || !profile.data) {
    redirect("/logout");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          {/* UBAH KE PROFIL MASJID */}
          <h2 className="text-2xl font-bold text-gray-800">Profil Masjid</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola identitas resmi dan kontak operasional yang akan ditampilkan ke jamaah.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <ProfileForm initialData={{
          official_name: profile.data.official_name ?? "",
          kind: profile.data.kind ?? "masjid",
          short_name: profile.data.short_name ?? "",
          province: profile.data.province ?? "",
          city: profile.data.city ?? "",
          address_full: profile.data.address_full ?? "",
          phone_whatsapp: profile.data.phone_whatsapp ?? "",
          email: profile.data.email ?? "",
          subdomain: profile.data.subdomain ?? "",
          header_image_url: profile.data.header_image_url ?? "",
        }} />
      </div>
    </div>
  );
}