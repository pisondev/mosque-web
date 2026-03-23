import {
  getPrayerCalendar,
  getPrayerSettings,
  listPrayerDuties,
  listPrayerTimes,
  listSpecialDays,
} from "../../actions/worship";
import AgendaManager from "./AgendaManager";

export default async function AgendaPage() {
  const [settingsRes, prayerTimesRes, dutiesRes, specialDaysRes, calendarRes] = await Promise.all([
    getPrayerSettings(),
    listPrayerTimes(),
    listPrayerDuties(),
    listSpecialDays(),
    getPrayerCalendar(),
  ]);

  const settings = settingsRes?.data || {};
  const prayerTimes = Array.isArray(prayerTimesRes?.data) ? prayerTimesRes.data : [];
  const duties = Array.isArray(dutiesRes?.data) ? dutiesRes.data : [];
  const specialDays = Array.isArray(specialDaysRes?.data) ? specialDaysRes.data : [];
  const calendarData = Array.isArray(calendarRes?.data) ? calendarRes.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-800">Jadwal & Agenda Ibadah</h2>
        <p className="text-gray-500 text-sm mt-1">
          Pusat kendali pengaturan waktu salat, penugasan takmir, dan hari besar masjid.
        </p>
      </div>

      {/* Komponen Client Utama dengan props yang tepat */}
      <AgendaManager 
        initialSettings={settings}
        initialPrayerTimes={prayerTimes}
        initialDuties={duties}
        initialSpecialDays={specialDays}
        calendarData={calendarData}
      />
      
    </div>
  );
}