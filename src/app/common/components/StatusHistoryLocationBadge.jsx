import React, { useState } from 'react';
import { MapPin, ExternalLink, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';

export default function StatusHistoryLocationBadge({ latitude, longitude, label = '' }) {
  const [showPreview, setShowPreview] = useState(false);

  if (latitude == null || longitude == null || latitude === '' || longitude === '') {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const openStreetMapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.003}%2C${lng + 0.005}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="flex flex-col gap-1.5 mt-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* GPS Coordinate Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-[11px] font-mono shadow-xs">
          <MapPin size={12} className="text-blue-700 dark:text-blue-400 shrink-0" />
          <span>
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
          {label && <span className="text-[var(--ink-3)] font-sans ml-1 text-[10px]">({label})</span>}
        </div>

        {/* Google Maps Link */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-3)] text-[var(--ink-2)] hover:text-[var(--ink)] border border-[var(--line)] text-[10px] font-semibold transition-colors cursor-pointer"
          title="Open in Google Maps"
        >
          <span>Google Maps</span>
          <ExternalLink size={10} className="text-[var(--ink-3)]" />
        </a>

        {/* Toggle Mini Map Preview */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface-3)] hover:bg-[var(--surface-3)] text-[var(--ink-2)] hover:text-blue-700 dark:hover:text-blue-400 border border-[var(--line)] text-[10px] font-semibold transition-colors cursor-pointer"
          title={showPreview ? 'Hide preview' : 'Preview location on map'}
        >
          <MapIcon size={11} className="text-blue-700 dark:text-blue-400" />
          <span>{showPreview ? 'Hide Map' : 'Preview'}</span>
          {showPreview ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </div>

      {/* Expandable Embedded Map Preview */}
      {showPreview && (
        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--surface-2)] mt-1 shadow-md animate-in fade-in zoom-in-95 duration-150">
          <iframe
            title={`GPS location at ${lat}, ${lng}`}
            src={openStreetMapEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-[10px] text-[var(--ink-2)] font-mono shadow-md backdrop-blur-xs">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}
