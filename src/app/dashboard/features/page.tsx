import { listFeatureCatalog, listWebsiteFeatures } from "../../actions/engagement";
import FeatureManager from "./FeatureManager";
import { Sparkles } from "lucide-react";

export default async function FeaturesPage() {
  const [catalogRes, featuresRes] = await Promise.all([
    listFeatureCatalog(),
    listWebsiteFeatures()
  ]);

  const catalog = Array.isArray(catalogRes?.data) ? catalogRes.data : [];
  const features = Array.isArray(featuresRes?.data) ? featuresRes.data : [];

  const mergedFeatures = catalog.map((cat: any) => {
    const tenantFeature = features.find((f: any) => f.feature_id === cat.id);
    return {
      ...cat,
      feature_id: cat.id,
      tenant_id: tenantFeature?.id || null,
      enabled: tenantFeature ? tenantFeature.enabled : false,
      is_active: tenantFeature ? tenantFeature.is_active : false,
      detail: tenantFeature?.detail || "",
      note: tenantFeature?.note || ""
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fasilitas & Layanan Masjid</h2>
          <p className="text-gray-500 text-sm mt-1">
            Aktifkan layanan dan kelengkapan fasilitas yang dimiliki oleh masjid untuk diinformasikan ke jamaah.
          </p>
        </div>
      </div>

      <FeatureManager mergedFeatures={mergedFeatures} />
    </div>
  );
}