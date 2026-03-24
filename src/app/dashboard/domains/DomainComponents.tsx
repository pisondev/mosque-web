"use client";

import { useTransition, useRef, useState } from "react";
import { createDomain, deleteDomain, updateDomainStatus } from "../../actions/domains";
import CustomSelect from "../../../components/ui/CustomSelect";
import { useToast } from "../../../components/ui/Toast";
import { Plus, Trash2 } from "lucide-react";

// --- 1. KOMPONEN FORM TAMBAH DOMAIN ---
export function CreateDomainForm() {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  // State lokal untuk memantau jenis domain agar bisa menampilkan hint yang berbeda
  const [domainType, setDomainType] = useState("subdomain");

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const res = await createDomain(formData);
      
      if (res?.error) {
        addToast(res.error, "error");
      } else {
        addToast("Domain baru berhasil didaftarkan!", "success");
        formRef.current?.reset();
      }
    });
  };

  return (
    <form id="form-domain" ref={formRef} action={handleAction} className="space-y-6">
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jenis Domain <span className="text-rose-500">*</span></label>
        <CustomSelect
          name="domain_type"
          defaultValue="subdomain"
          onChange={(val) => setDomainType(val)}
          disabled={isPending}
          options={[
            { label: "Subdomain eTAKMIR", value: "subdomain" },
            { label: "Custom Domain Sendiri", value: "custom_domain" }
          ]}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hostname / Alamat Web <span className="text-rose-500">*</span></label>
        <input
          type="text"
          name="hostname"
          required
          disabled={isPending}
          placeholder={domainType === "subdomain" ? "masjid-alfalah.mosquesaas.com" : "www.masjidalfalah.id"}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900 disabled:bg-gray-100 shadow-sm font-mono"
        />
        {domainType === "custom_domain" ? (
          <p className="text-[10px] text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded border border-amber-100">
            ⚠️ Pastikan Anda sudah mengarahkan CNAME/A Record domain Anda ke server eTAKMIR sebelum menambahkan.
          </p>
        ) : (
          <p className="text-[10px] text-gray-500 mt-2">
            Pilih nama yang singkat dan mudah diingat jamaah.
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95"
        >
          {isPending ? "Mendaftarkan..." : <><Plus className="w-4 h-4" /> Daftarkan Domain</>}
        </button>
      </div>
    </form>
  );
}

// --- 2. KOMPONEN DROPDOWN STATUS DOMAIN ---
export function DomainStatusControl({ id, currentStatus, hostname }: { id: number; currentStatus: string, hostname: string }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const handleStatusChange = (nextStatus: string) => {
    startTransition(async () => {
      const res = await updateDomainStatus(id, nextStatus);
      if (res?.error) {
        addToast("Gagal mengubah status domain.", "error");
      } else {
        addToast(`Status "${hostname}" berhasil diubah!`, "success");
      }
    });
  };

  return (
    <CustomSelect
      name={`status-${id}`}
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={handleStatusChange}
      options={[
        { label: "⏳ Pending", value: "pending" },
        { label: "🔎 Verifying", value: "verifying" },
        { label: "🟢 Active", value: "active" },
        { label: "🔴 Disabled", value: "disabled" }
      ]}
    />
  );
}

// --- 3. KOMPONEN TOMBOL HAPUS DOMAIN ---
export function DeleteDomainButton({ id, hostname }: { id: number, hostname: string }) {
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const handleDelete = () => {
    if (!window.confirm(`Yakin ingin mencabut domain "${hostname}" dari sistem?`)) return;
    
    startTransition(async () => {
      const res = await deleteDomain(id);
      if (res?.error) {
        addToast(res.error, "error");
      } else {
         addToast(`Domain ${hostname} berhasil dihapus.`, "success");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="Hapus Domain"
      className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-md border border-gray-200 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}