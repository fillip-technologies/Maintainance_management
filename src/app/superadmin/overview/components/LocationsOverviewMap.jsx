import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronRight,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  MapPin,
  Building2,
  LocateFixed,
  Layers,
  Sparkles,
} from 'lucide-react';

import { CHART_PALETTE, TEXT } from '../../../../tokens';

const DEFAULT_PIN_COLORS = CHART_PALETTE;

export function mapCoordsToGps(mapX, mapY) {
  if (mapX == null || mapY == null || mapX === '' || mapY === '') return { lat: null, lng: null };
  const lat = Number((25.85 - (Number(mapY) / 100) * 1.3).toFixed(4));
  const lng = Number((84.85 + (Number(mapX) / 100) * 1.0).toFixed(4));
  return { lat, lng };
}

function loadLeafletScript() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    if (document.getElementById('leaflet-script-loader')) {
      const check = setInterval(() => {
        if (window.L) {
          clearInterval(check);
          resolve(window.L);
        }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.id = 'leaflet-script-loader';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.crossOrigin = '';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function LocationsOverviewMap({
  facilities,
  locations,
  selectedId,
  onSelectLocation,
  loading,
  className = '',
}) {
  // Use real backend facilities only — no hardcoded fallback data
  const items = useMemo(() => {
    if (facilities && facilities.length > 0) return facilities;
    if (locations && locations.length > 0) return locations;
    return [];
  }, [facilities, locations]);

  const [activeLocId, setActiveLocId] = useState(
    selectedId || (items[0]?.clientId || items[0]?.id || '')
  );
  const [mapLayer, setMapLayer] = useState('satellite'); // 'satellite' | 'streets'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const tileLayerRef = useRef(null);

  // Sync activeLocId if selectedId prop changes or first item loads
  useEffect(() => {
    if (selectedId) {
      setActiveLocId(selectedId);
    } else if (items.length > 0 && !activeLocId) {
      setActiveLocId(items[0].clientId || items[0].id);
    }
  }, [selectedId, items, activeLocId]);

  // Compute GPS coordinates for all items
  const itemsWithGps = useMemo(() => {
    return items.map((loc, idx) => {
      const id = loc.clientId || loc.id;
      let lat = loc.latitude ? Number(loc.latitude) : null;
      let lng = loc.longitude ? Number(loc.longitude) : null;

      // If lat/lng missing, derive from regional map placement
      if ((lat == null || lng == null) && (loc.mapX != null && loc.mapY != null)) {
        const derived = mapCoordsToGps(loc.mapX, loc.mapY);
        lat = derived.lat;
        lng = derived.lng;
      }

      // Default fallback coordinates if completely unspecified
      if (lat == null || lng == null) {
        lat = 25.5941 + (idx * 0.05);
        lng = 85.1376 + (idx * 0.05);
      }

      const pinColor = loc.pinColor || DEFAULT_PIN_COLORS[idx % DEFAULT_PIN_COLORS.length];

      return {
        ...loc,
        resolvedLat: lat,
        resolvedLng: lng,
        resolvedColor: pinColor,
        uniqueId: id,
      };
    });
  }, [items]);

  // Handle facility selection
  const handleSelect = (id) => {
    setActiveLocId(id);
    if (onSelectLocation) onSelectLocation(id);

    const target = itemsWithGps.find((i) => i.uniqueId === id);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.resolvedLat, target.resolvedLng], 15, {
        duration: 1,
      });
      const marker = markersRef.current[id];
      if (marker && marker.openTooltip) {
        marker.openTooltip();
      }
    }
  };

  // Switch Layer (Satellite vs Street)
  const handleLayerSwitch = (layer) => {
    setMapLayer(layer);
    if (!mapInstanceRef.current || !window.L) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      layer === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileAttribution =
      layer === 'satellite'
        ? 'Tiles &copy; Esri &mdash; Earthstar Geographics'
        : '&copy; OpenStreetMap contributors';

    tileLayerRef.current = window.L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: tileAttribution,
    }).addTo(mapInstanceRef.current);
  };

  // Recenter to all pins
  const handleFitAll = () => {
    if (!mapInstanceRef.current || !window.L || itemsWithGps.length === 0) return;
    const bounds = window.L.latLngBounds(
      itemsWithGps.map((i) => [i.resolvedLat, i.resolvedLng])
    );
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (loading || !mapContainerRef.current) return;

    let isMounted = true;

    loadLeafletScript()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Cleanup existing map if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const initialCenter =
          itemsWithGps.length > 0
            ? [itemsWithGps[0].resolvedLat, itemsWithGps[0].resolvedLng]
            : [25.5941, 85.1376];

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 12,
          zoomControl: false,
        });

        // Add zoom controls
        L.control.zoom({ position: 'topleft' }).addTo(map);

        // Tile layer
        const tileUrl =
          mapLayer === 'satellite'
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        tileLayerRef.current = L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution:
            mapLayer === 'satellite'
              ? 'Tiles &copy; Esri'
              : '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Create Markers for all real facilities
        markersRef.current = {};
        itemsWithGps.forEach((loc) => {
          const isSelected = activeLocId === loc.uniqueId;
          const name = loc.facilityName || loc.name;

          const pinHtml = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%); cursor: pointer;">
              ${
                isSelected
                  ? `<span style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background-color: ${loc.resolvedColor}; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                  : ''
              }
              <div style="width: 30px; height: 30px; border-radius: 50%; background: ${loc.resolvedColor}; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; transition: transform 0.2s;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div style="position: absolute; bottom: -4px; width: 8px; height: 8px; background: ${loc.resolvedColor}; transform: rotate(45deg); border-right: 1.5px solid white; border-bottom: 1.5px solid white;"></div>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'facility-overview-pin',
            html: pinHtml,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const marker = L.marker([loc.resolvedLat, loc.resolvedLng], {
            icon: customIcon,
          }).addTo(map);

          marker.bindTooltip(
            `<b>${name}</b><br/><span style="font-size: 10px; color: ${TEXT.secondary};">${loc.devices ?? 0} Devices</span>`,
            {
              permanent: false,
              direction: 'top',
              offset: [0, -32],
              className: 'custom-leaflet-tooltip',
            }
          );

          marker.on('click', () => {
            handleSelect(loc.uniqueId);
          });

          markersRef.current[loc.uniqueId] = marker;
        });

        // Fit bounds to all markers if multiple
        if (itemsWithGps.length > 1) {
          const bounds = L.latLngBounds(
            itemsWithGps.map((i) => [i.resolvedLat, i.resolvedLng])
          );
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }

        mapInstanceRef.current = map;
        setIsMapReady(true);

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      })
      .catch((err) => {
        console.error('[LocationsOverviewMap] Failed to load Leaflet:', err);
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, itemsWithGps.length]); // Refresh map when real items load

  // Skeletonizer loading state
  if (loading) {
    return (
      <div
        className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-md h-full min-h-[440px] xl:min-h-0 animate-pulse ${className}`}
      >
        {/* Skeleton Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex flex-col gap-2">
            <div className="h-5 w-44 bg-slate-800 rounded-lg" />
            <div className="h-3 w-64 bg-slate-800/60 rounded-md" />
          </div>
          <div className="h-8 w-28 bg-slate-800/70 rounded-xl" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0">
          {/* Skeleton Map Canvas */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col items-center justify-center min-h-[280px] lg:min-h-0 h-full p-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-700 animate-bounce">
              <MapPin size={24} />
            </div>
            <div className="h-3.5 w-36 bg-slate-800 rounded mt-3" />
            <div className="h-2.5 w-48 bg-slate-800/50 rounded mt-1.5" />
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>

          {/* Skeleton Right List Items */}
          <div className="lg:col-span-5 flex flex-col gap-2.5 justify-start">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-full bg-slate-800 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-3.5 w-28 bg-slate-800 rounded" />
                  <div className="h-2.5 w-20 bg-slate-800/60 rounded" />
                </div>
                <div className="w-4 h-4 rounded bg-slate-800/40 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-md transition-all duration-300 h-full min-h-[440px] xl:min-h-0 ${
        isFullscreen
          ? 'fixed inset-4 z-50 overflow-auto bg-slate-950/95 backdrop-blur-xl'
          : 'relative z-0 isolate'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Locations Overview
          </h2>
          <p className="text-xs text-slate-400">
            All registered facilities &amp; project sites ({items.length} {items.length === 1 ? 'client' : 'clients'})
          </p>
        </div>

        {/* Map Header Controls: Satellite / Street Toggle & Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Layer Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => handleLayerSwitch('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mapLayer === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              type="button"
              onClick={() => handleLayerSwitch('streets')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mapLayer === 'streets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ Streets
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Content Grid: Real Map (Left) + Locations List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0">
        {/* Real-World Map Canvas Container (7 cols on lg) */}
        <div className="lg:col-span-7 relative z-0 isolate rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-center select-none shadow-inner group min-h-[280px] lg:min-h-0 h-full">
          <div ref={mapContainerRef} className="w-full h-full min-h-[280px] relative z-0" />

          {/* Floating Fit All Action Button */}
          {itemsWithGps.length > 1 && (
            <button
              type="button"
              onClick={handleFitAll}
              className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold border border-slate-700 shadow-xl backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer hover:border-blue-500"
              title="Show All Facilities"
            >
              <LocateFixed size={14} className="text-blue-400" />
              <span>Fit All</span>
            </button>
          )}
        </div>

        {/* Right Locations List (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-start gap-1.5 overflow-y-auto min-h-0 h-full max-h-[320px] lg:max-h-none pr-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 rounded-xl border border-dashed border-slate-800">
              <Building2 size={32} className="text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-300">No Facilities Registered</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                Provision a client facility to view its pin on the interactive map.
              </p>
            </div>
          ) : (
            items.map((loc) => {
              const id = loc.clientId || loc.id;
              const name = loc.facilityName || loc.name;
              const isSelected = activeLocId === id;
              const image = loc.imageUrl || loc.image;
              const devicesCount = loc.devices ?? 0;
              const isFaulty = (loc.faultyDevices ?? loc.offline ?? 0) > 0;
              const isMaint = (loc.underMaintenanceDevices ?? loc.maintenance ?? 0) > 0;
              const breakdownText =
                loc.breakdownText ||
                (isFaulty || isMaint
                  ? `${loc.faultyDevices ?? loc.offline ?? 0} Offline | ${
                      loc.underMaintenanceDevices ?? loc.maintenance ?? 0
                    } Maintenance`
                  : 'All Online');

              return (
                <div
                  key={id}
                  onClick={() => handleSelect(id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-slate-800/40 hover:border-slate-800'
                  }`}
                >
                  {/* Circular Photo Thumbnail or Icon */}
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-700 shrink-0 shadow-sm flex items-center justify-center bg-slate-900">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    ) : (
                      <Building2 size={20} className="text-blue-400" />
                    )}
                  </div>

                  {/* Info Text */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isFaulty
                            ? 'bg-rose-500'
                            : isMaint
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {name}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 mt-0.5">
                      {devicesCount} Devices
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {breakdownText}
                    </span>
                  </div>

                  {/* Chevron Arrow */}
                  <ChevronRight
                    size={16}
                    className={`shrink-0 transition-transform ${
                      isSelected
                        ? 'text-blue-400 translate-x-0.5'
                        : 'text-slate-500'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
