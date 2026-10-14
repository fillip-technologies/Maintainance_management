import React from 'react';
import { Check } from 'lucide-react';

/**
 * Checkbox list for assigning a user to one or more zones.
 * `value` is an array of zone ids; `onChange` receives the next array.
 */
export default function ZoneMultiSelect({ zones, value, onChange, loading, disabled }) {
  if (loading) {
    return (
      <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-400">
        Loading zones…
      </div>
    );
  }

  const selected = new Set(value);
  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
        {zones.map((z) => {
          const checked = selected.has(z.id);
          return (
            <button
              type="button"
              key={z.id}
              disabled={disabled}
              onClick={() => toggle(z.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 ${
                checked ? 'bg-indigo-50/80 text-indigo-900' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                }`}
              >
                {checked && <Check size={11} />}
              </span>
              <span className="truncate">{z.name}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500">
        {selected.size} zone{selected.size === 1 ? '' : 's'} selected
      </p>
    </div>
  );
}
