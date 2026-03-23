"use client";

import { useState, useTransition } from "react";
import {
  createPrayerDuty,
  createPrayerTime,
  createSpecialDay,
  deletePrayerDuty,
  deletePrayerTime,
  deleteSpecialDay,
  updatePrayerDuty,
  updatePrayerSettings,
  updatePrayerTime,
  updateSpecialDay,
} from "../../actions/worship";

type JsonRecord = Record<string, unknown>;

function JsonEditor({
  title,
  defaultValue,
  submitLabel,
  action,
}: {
  title: string;
  defaultValue: JsonRecord;
  submitLabel: string;
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setMessage(null);
          const res = await action(formData);
          setMessage(res.error || "Berhasil diproses.");
        });
      }}
      className="space-y-3"
    >
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <textarea
        name="payload"
        rows={7}
        defaultValue={JSON.stringify(defaultValue, null, 2)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono text-xs"
      />
      {message && (
        <div
          className={`text-xs px-3 py-2 rounded-lg border ${
            message.includes("Berhasil")
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-700 bg-red-50 border-red-200"
          }`}
        >
          {message}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-lg"
      >
        {isPending ? "Memproses..." : submitLabel}
      </button>
    </form>
  );
}

function DeleteBox({
  title,
  onDelete,
}: {
  title: string;
  onDelete: (id: number) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [id, setId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={id}
          onChange={(event) => setId(event.target.value)}
          placeholder="ID"
          className="w-24 px-3 py-2 rounded-lg border border-gray-300 text-sm"
        />
        <button
          disabled={isPending || !id}
          onClick={() => {
            startTransition(async () => {
              setMessage(null);
              const res = await onDelete(Number(id));
              setMessage(res.error || "Berhasil diproses.");
            });
          }}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold py-2 px-4 rounded-lg"
        >
          Hapus
        </button>
      </div>
      {message && (
        <div
          className={`text-xs px-3 py-2 rounded-lg border ${
            message.includes("Berhasil")
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-700 bg-red-50 border-red-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default function AgendaConsole() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <JsonEditor
          title="Update Prayer Time Settings"
          defaultValue={{
            timezone: "Asia/Jakarta",
            location_mode: "city",
            city_name: "Yogyakarta",
            calc_method: "kemenag",
            asr_madhhab: "shafii",
            adj_subuh_min: 0,
            adj_dzuhur_min: 0,
            adj_ashar_min: 0,
            adj_maghrib_min: 0,
            adj_isya_min: 0,
          }}
          submitLabel="Simpan Pengaturan"
          action={updatePrayerSettings}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <JsonEditor
            title="Create Prayer Times Daily"
            defaultValue={{
              day_date: "2026-03-25",
              subuh_time: "04:31",
              dzuhur_time: "11:55",
              ashar_time: "15:12",
              maghrib_time: "17:58",
              isya_time: "19:05",
              sunrise_time: "05:42",
              dhuha_time: "06:15",
            }}
            submitLabel="Tambah Jadwal Harian"
            action={createPrayerTime}
          />
          <JsonEditor
            title="Update Prayer Times Daily"
            defaultValue={{
              day_date: "2026-03-25",
              subuh_time: "04:32",
              dzuhur_time: "11:56",
              ashar_time: "15:13",
              maghrib_time: "17:59",
              isya_time: "19:06",
            }}
            submitLabel="Update Jadwal Harian"
            action={(formData) => updatePrayerTime(formData)}
          />
          <DeleteBox title="Delete Prayer Times Daily by ID" onDelete={deletePrayerTime} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <JsonEditor
            title="Create Prayer Duty"
            defaultValue={{
              category: "daily",
              duty_date: "2026-03-25",
              prayer: "subuh",
              imam_name: "Ustadz Ahmad",
              muadzin_name: "Bapak Rahman",
              note: "Petugas cadangan disiapkan",
            }}
            submitLabel="Tambah Petugas Ibadah"
            action={createPrayerDuty}
          />
          <JsonEditor
            title="Update Prayer Duty"
            defaultValue={{
              category: "daily",
              duty_date: "2026-03-25",
              prayer: "subuh",
              imam_name: "Ustadz Budi",
              muadzin_name: "Bapak Fajar",
              note: "Update petugas",
            }}
            submitLabel="Update Petugas Ibadah"
            action={(formData) => updatePrayerDuty(formData)}
          />
          <DeleteBox title="Delete Prayer Duty by ID" onDelete={deletePrayerDuty} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
        <JsonEditor
          title="Create Special Day"
          defaultValue={{
            kind: "other",
            title: "Tahun Baru Hijriah",
            day_date: "2026-06-17",
            start_time: "19:30",
            note: "Kajian spesial dan doa bersama",
          }}
          submitLabel="Tambah Hari Besar"
          action={createSpecialDay}
        />
        <JsonEditor
          title="Update Special Day"
          defaultValue={{
            kind: "other",
            title: "Tahun Baru Hijriah Updated",
            day_date: "2026-06-17",
            start_time: "20:00",
            note: "Perubahan jadwal",
          }}
          submitLabel="Update Hari Besar"
          action={(formData) => updateSpecialDay(formData)}
        />
        <DeleteBox title="Delete Special Day by ID" onDelete={deleteSpecialDay} />
      </div>
    </div>
  );
}
