import { MapPin } from 'lucide-react';

/** Dropdown to pick which assigned zone to view. Renders nothing for 0–1 zones. */
export default function ZoneSwitcher({ zones, activeZoneId, onChange }) {
  if (!zones || zones.length < 2) return null;
  return (
    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700">
      <MapPin size={14} className="text-indigo-500" />
      <select
        value={activeZoneId ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-hidden cursor-pointer"
        aria-label="Active zone"
      >
        {zones.map((z) => (
          <option key={z.id} value={z.id}>{z.name}</option>
        ))}
      </select>
    </label>
  );
}
