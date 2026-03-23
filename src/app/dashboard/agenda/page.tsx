import {
  getPrayerCalendar,
  getPrayerSettings,
  listPrayerDuties,
  listPrayerTimes,
  listSpecialDays,
} from "../../actions/worship";
import AgendaConsole from "./AgendaConsole";

type GenericItem = Record<string, unknown>;

function PreviewTable({
  title,
  rows,
}: {
  title: string;
  rows: GenericItem[];
}) {
  const items = rows.slice(0, 5);
  const headers = items.length > 0 ? Object.keys(items[0]).slice(0, 5) : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              {headers.map((header) => (
                <th key={header} className="px-4 py-2 font-semibold capitalize">
                  {header.replaceAll("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={Math.max(headers.length, 1)}>
                  Belum ada data.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td key={header} className="px-4 py-2 text-gray-700">
                      {String(item[header] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AgendaPage() {
  const [settingsRes, prayerTimesRes, dutiesRes, specialDaysRes, calendarRes] = await Promise.all([
    getPrayerSettings(),
    listPrayerTimes(),
    listPrayerDuties(),
    listSpecialDays(),
    getPrayerCalendar(),
  ]);

  const prayerTimes = Array.isArray(prayerTimesRes?.data) ? prayerTimesRes.data : [];
  const duties = Array.isArray(dutiesRes?.data) ? dutiesRes.data : [];
  const specialDays = Array.isArray(specialDaysRes?.data) ? specialDaysRes.data : [];
  const calendarData = Array.isArray(calendarRes?.data) ? calendarRes.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Jadwal & Agenda Ibadah</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelola konfigurasi waktu salat, jadwal harian, petugas ibadah, hari besar, dan kalender.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Snapshot Prayer Time Settings</h3>
        <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto">
          {JSON.stringify(settingsRes?.data || {}, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PreviewTable title="Prayer Times Daily (5 data terbaru)" rows={prayerTimes} />
        <PreviewTable title="Prayer Duties (5 data terbaru)" rows={duties} />
        <PreviewTable title="Special Days (5 data terbaru)" rows={specialDays} />
        <PreviewTable title="Prayer Calendar (30 hari)" rows={calendarData} />
      </div>

      <AgendaConsole />
    </div>
  );
}
