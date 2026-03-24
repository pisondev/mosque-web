import { listSocialLinks, listExternalLinks } from "../../actions/engagement";
import LinkManager from "./LinkManager";
import { Link2 } from "lucide-react";

export default async function LinksPage() {
  const [socialRes, externalRes] = await Promise.all([
    listSocialLinks(1, 50),
    listExternalLinks(1, 50)
  ]);

  const socialLinks = Array.isArray(socialRes?.data) ? socialRes.data : [];
  const externalLinks = Array.isArray(externalRes?.data) ? externalRes.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <Link2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Tautan Publik</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola tautan media sosial masjid dan tautan eksternal (aplikasi pihak ketiga, form pendaftaran, dll).
          </p>
        </div>
      </div>

      <LinkManager initialSocial={socialLinks} initialExternal={externalLinks} />
    </div>
  );
}