import { redirect } from "next/navigation";
import { getProfileFormData } from "../../actions/profile";
import ProfileForm from "./ProfileForm";
import { Building2 } from "lucide-react";

export default async function ProfilePage() {
  const profile = await getProfileFormData();

  if (profile.unauthorized) {
    redirect("/auth?mode=login");
  }

  const data = profile.data ?? {
    official_name: "",
    kind: "masjid",
    short_name: "",
    province: "",
    city: "",
    address_full: "",
    phone_whatsapp: "",
    email: "",
    subdomain: "",
    header_image_url: "",
  };

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

      {profile.error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {profile.error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <ProfileForm initialData={{
          official_name: data.official_name ?? "",
          kind: data.kind ?? "masjid",
          short_name: data.short_name ?? "",
          province: data.province ?? "",
          city: data.city ?? "",
          address_full: data.address_full ?? "",
          phone_whatsapp: data.phone_whatsapp ?? "",
          email: data.email ?? "",
          subdomain: data.subdomain ?? "",
          header_image_url: data.header_image_url ?? "",
        }} />
      </div>
    </div>
  );
}
