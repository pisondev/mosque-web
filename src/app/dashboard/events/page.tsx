import { listEvents } from "../../actions/community";
import EventManager from "./EventManager";
import { Megaphone } from "lucide-react";

export default async function EventsPage() {
  const eventsRes = await listEvents(1, 100); // Ambil hingga 100 event
  const events = Array.isArray(eventsRes?.data) ? eventsRes.data : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      <div className="border-b border-gray-200 pb-5 flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 shadow-sm">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Event & Kegiatan</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola agenda komunitas, kajian, kegiatan sosial, dan publikasi event masjid.
          </p>
        </div>
      </div>

      {/* Semua logika Tabel dan Form Interaktif ditangani oleh Client Component ini */}
      <EventManager initialEvents={events} />
    </div>
  );
}