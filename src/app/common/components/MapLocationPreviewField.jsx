import React, { useState } from 'react';
import { MapPin, Compass, Navigation, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import MapLocationPickerModal from './MapLocationPickerModal';
import satelliteMapImg from '../../../assets/locations/satellite_map.jpg';
import { MAP_PIN_DEFAULT } from '../../../tokens';

export default function MapLocationPreviewField({
  mapX,
  mapY,
  latitude,
  longitude,
  location = '',
  pinColor = MAP_PIN_DEFAULT,
  facilityName = '',
  onChange,
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);

  const hasCoords = (mapX != null && mapX !== '') || (latitude != null && latitude !== '');
  const displayX = mapX != null && mapX !== '' ? Number(mapX) : null;
  const displayY = mapY != null && mapY !== '' ? Number(mapY) : null;

  const handlePickerConfirm = (coords) => {
    if (onChange) {
      onChange({
        mapX: coords.mapX,
        mapY: coords.mapY,
        latitude: coords.latitude,
        longitude: coords.longitude,
        location: coords.location,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <MapPin size={13} className="text-blue-400" />
          <span>Map Location &amp; Coordinates</span>
        </label>
        <button
          type="button"
          onClick={() => setShowManualFields(!showManualFields)}
          className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Sliders size={11} />
          <span>{showManualFields ? 'Hide manual fields' : 'Manual entry'}</span>
          {showManualFields ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Visual Placement Card */}
      <div className="p-3 rounded-2xl border border-slate-800 bg-slate-900/90 flex items-center gap-3.5 shadow-md hover:border-slate-700 transition-colors">
        {/* Mini Map Thumbnail Preview */}
        <div
          onClick={() => setIsPickerOpen(true)}
          className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0 cursor-pointer group shadow-xs"
          title="Click to open map picker"
        >
          <img
            src={satelliteMapImg}
            alt="Mini Map"
            className="w-full h-full object-cover brightness-90 contrast-110 group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/0 transition-colors" />

          {/* Active Pin on Mini Map */}
          {displayX != null && displayY != null ? (
            <div
              style={{ left: `${displayX}%`, top: `${displayY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse"
                style={{ backgroundColor: pinColor }}
              >
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin size={16} className="text-blue-400 animate-bounce" />
            </div>
          )}
        </div>

        {/* Coordinate Details & Action Button */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          {hasCoords ? (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-xs shadow-emerald-500/50" />
                <span className="truncate">Placed on Map</span>
              </div>
              {location && (
                <span className="text-[11px] font-semibold text-slate-300 truncate mt-0.5 max-w-[240px]" title={location}>
                  📍 {location}
                </span>
              )}
              <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-300 font-mono mt-0.5">
                {displayX != null && (
                  <span className="bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300">
                    X: {displayX}% • Y: {displayY}%
                  </span>
                )}
                {latitude && (
                  <span className="bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300 truncate">
                    GPS: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">No Location Placed</span>
              <span className="text-[11px] text-slate-400">Click button or map preview to place on map</span>
            </div>
          )}
        </div>

        {/* Pick Button */}
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <MapPin size={14} />
          <span>{hasCoords ? 'Adjust on Map' : 'Pick on Map'}</span>
        </button>
      </div>

      {/* Expandable Manual Inputs */}
      {showManualFields && (
        <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Navigation size={12} className="text-emerald-400" /> Latitude
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 25.0189"
                value={latitude || ''}
                onChange={(e) =>
                  onChange &&
                  onChange({
                    mapX,
                    mapY,
                    latitude: e.target.value,
                    longitude,
                  })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium placeholder:text-slate-500 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Navigation size={12} className="text-emerald-400" /> Longitude
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 85.4214"
                value={longitude || ''}
                onChange={(e) =>
                  onChange &&
                  onChange({
                    mapX,
                    mapY,
                    latitude,
                    longitude: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium placeholder:text-slate-500 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Compass size={12} className="text-blue-400" /> Map X Position (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                placeholder="0 - 100%"
                value={mapX || ''}
                onChange={(e) =>
                  onChange &&
                  onChange({
                    mapX: e.target.value,
                    mapY,
                    latitude,
                    longitude,
                  })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium placeholder:text-slate-500 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Compass size={12} className="text-blue-400" /> Map Y Position (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                placeholder="0 - 100%"
                value={mapY || ''}
                onChange={(e) =>
                  onChange &&
                  onChange({
                    mapX,
                    mapY: e.target.value,
                    latitude,
                    longitude,
                  })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium placeholder:text-slate-500 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* The Visual Picker Modal */}
      <MapLocationPickerModal
        isOpen={isPickerOpen}
        initialMapX={mapX}
        initialMapY={mapY}
        initialLat={latitude}
        initialLng={longitude}
        initialLocation={location}
        pinColor={pinColor}
        facilityName={facilityName}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handlePickerConfirm}
      />
    </div>
  );
}
