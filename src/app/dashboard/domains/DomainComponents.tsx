"use client";

import { useState, useTransition } from "react";
import { createDomain, deleteDomain, updateDomainStatus } from "../../actions/domains";

const DOMAIN_STATUS_OPTIONS = ["pending", "verifying", "active", "disabled"] as const;

export function CreateDomainForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const res = await createDomain(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      (document.getElementById("form-domain") as HTMLFormElement | null)?.reset();
    });
  };

  return (
    <form id="form-domain" action={handleAction} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Domain</label>
        <select
          name="domain_type"
          required
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white disabled:bg-gray-100"
        >
          <option value="subdomain">Subdomain</option>
          <option value="custom_domain">Custom Domain</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Hostname</label>
        <input
          type="text"
          name="hostname"
          required
          disabled={isPending}
          placeholder="contoh: masjid-alfalah.mosquesaas.com"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 disabled:bg-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {isPending ? "Menyimpan..." : "+ Tambah Domain"}
      </button>
    </form>
  );
}

export function DomainStatusControl({ id, currentStatus }: { id: number; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(event) => {
        const nextStatus = event.target.value;
        startTransition(async () => {
          const res = await updateDomainStatus(id, nextStatus);
          if (res?.error) {
            alert(res.error);
          }
        });
      }}
      className="px-2 py-1.5 rounded-md border border-gray-300 text-sm bg-white disabled:bg-gray-100"
    >
      {DOMAIN_STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

export function DeleteDomainButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm("Yakin ingin menghapus domain ini?")) return;
        startTransition(async () => {
          const res = await deleteDomain(id);
          if (res?.error) {
            alert(res.error);
          }
        });
      }}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
    >
      {isPending ? "Menghapus..." : "Hapus"}
    </button>
  );
}
