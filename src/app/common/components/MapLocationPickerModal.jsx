import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  MapPin,
  Maximize2,
  Minimize2,
  Check,
  Search,
  Layers,
  LocateFixed,
  Navigation,
  Loader2,
} from 'lucide-react';

export function mapCoordsToGps(mapX, mapY) {
  if (mapX == null || mapY == null || mapX === '' || mapY === '') return { lat: null, lng: null };
  const lat = Number((25.85 - (Number(mapY) / 100) * 1.3).toFixed(4));
  const lng = Number((84.85 + (Number(mapX) / 100) * 1.0).toFixed(4));
  return { lat, lng };
}

export function gpsToMapCoords(lat, lng) {
  if (lat == null || lng == null || lat === '' || lng === '') return { mapX: null, mapY: null };
  const mapY = Math.max(0, Math.min(100, Number((((25.85 - Number(lat)) / 1.3) * 100).toFixed(1))));
  const mapX = Math.max(0, Math.min(100, Number((((Number(lng) - 84.85) / 1.0) * 100).toFixed(1))));
  return { mapX, mapY };
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

export default function MapLocationPickerModal({
  isOpen,
  initialMapX,
  initialMapY,
  initialLat,
  initialLng,
  initialLocation = '',
  pinColor = '#3B82F6',
  facilityName = '',
  onClose,
  onConfirm,
}) {
  const [lat, setLat] = useState(initialLat != null && initialLat !== '' ? Number(initialLat) : 25.5941);
  const [lng, setLng] = useState(initialLng != null && initialLng !== '' ? Number(initialLng) : 85.1376);
  const [mapX, setMapX] = useState(initialMapX != null && initialMapX !== '' ? Number(initialMapX) : 50);
  const [mapY, setMapY] = useState(initialMapY != null && initialMapY !== '' ? Number(initialMapY) : 50);
  const [resolvedAddress, setResolvedAddress] = useState(initialLocation || '');

  const [mapLayer, setMapLayer] = useState('satellite'); // 'satellite' | 'streets'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Reverse geocoding to automatically resolve address from lat/lng
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: { 'Accept-Language': 'en' },
        }
      );
      const data = await res.json();
      if (data?.display_name) {
        setResolvedAddress(data.display_name);
      }
    } catch (e) {
      console.warn('[Map Picker] Reverse geocode error:', e);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Initialize coordinates on modal open
  useEffect(() => {
    if (isOpen) {
      let currentLat = initialLat != null && initialLat !== '' ? Number(initialLat) : null;
      let currentLng = initialLng != null && initialLng !== '' ? Number(initialLng) : null;
      let currentX = initialMapX != null && initialMapX !== '' ? Number(initialMapX) : null;
      let currentY = initialMapY != null && initialMapY !== '' ? Number(initialMapY) : null;

      if (currentLat == null || currentLng == null) {
        if (currentX != null && currentY != null) {
          const gps = mapCoordsToGps(currentX, currentY);
          currentLat = gps.lat ?? 25.5941;
          currentLng = gps.lng ?? 85.1376;
        } else {
          currentLat = 25.5941; // Patna center
          currentLng = 85.1376;
          currentX = 50;
          currentY = 50;
        }
      }

      if (currentX == null || currentY == null) {
        const mapped = gpsToMapCoords(currentLat, currentLng);
        currentX = mapped.mapX ?? 50;
        currentY = mapped.mapY ?? 50;
      }

      setLat(currentLat);
      setLng(currentLng);
      setMapX(currentX);
      setMapY(currentY);
      setResolvedAddress(initialLocation || '');

      // Trigger reverse geocode if no address provided
      if (!initialLocation && currentLat && currentLng) {
        reverseGeocode(currentLat, currentLng);
      }
    }
  }, [isOpen, initialLat, initialLng, initialMapX, initialMapY, initialLocation, reverseGeocode]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;

    loadLeafletScript()
      .then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Cleanup existing map if re-initializing
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: false,
        });

        // Add custom zoom controls in top-left
        L.control.zoom({ position: 'topleft' }).addTo(map);

        // Tile layer
        const tileUrl =
          mapLayer === 'satellite'
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const tileAttribution =
          mapLayer === 'satellite'
            ? 'Tiles &copy; Esri &mdash; Earthstar Geographics'
            : '&copy; OpenStreetMap contributors';

        tileLayerRef.current = L.tileLayer(tileUrl, {
          maxZoom: 19,
          attribution: tileAttribution,
        }).addTo(map);

        // Custom draggable pin marker icon
        const pinHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${pinColor}; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div style="position: absolute; bottom: -5px; width: 10px; height: 10px; background: ${pinColor}; transform: rotate(45deg); border-right: 2px solid white; border-bottom: 2px solid white;"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'interactive-drop-pin',
          html: pinHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        // Draggable pin marker
        const marker = L.marker([lat, lng], {
          icon: customIcon,
          draggable: true,
          autoPan: true,
        }).addTo(map);

        marker.bindTooltip('Drag or click anywhere to drop pin', {
          permanent: false,
          direction: 'top',
          offset: [0, -32],
        });

        // Event: Marker Drag End
        marker.on('dragend', (e) => {
          const position = e.target.getLatLng();
          const newLat = Number(position.lat.toFixed(6));
          const newLng = Number(position.lng.toFixed(6));
          setLat(newLat);
          setLng(newLng);
          const mapped = gpsToMapCoords(newLat, newLng);
          setMapX(mapped.mapX ?? 50);
          setMapY(mapped.mapY ?? 50);
          reverseGeocode(newLat, newLng);
        });

        // Event: Click on Map to Drop Pin
        map.on('click', (e) => {
          const newLat = Number(e.latlng.lat.toFixed(6));
          const newLng = Number(e.latlng.lng.toFixed(6));
          setLat(newLat);
          setLng(newLng);
          const mapped = gpsToMapCoords(newLat, newLng);
          setMapX(mapped.mapX ?? 50);
          setMapY(mapped.mapY ?? 50);
          marker.setLatLng([newLat, newLng]);
          reverseGeocode(newLat, newLng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setIsMapReady(true);

        // Invalidate map size after animation/modal mount
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 250);
      })
      .catch((err) => {
        console.error('[Map Picker] Failed to load Leaflet:', err);
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, pinColor, reverseGeocode]);

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

  // Center to Current Pin
  const handleCenterToPin = () => {
    if (mapInstanceRef.current && lat != null && lng != null) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1 });
    }
  };

  // Autocomplete / Search input handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            val
          )}&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSearchResults(data || []);
        setShowDropdown(true);
      } catch (err) {
        console.warn('[Map Picker] Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectSearchResult = (result) => {
    const newLat = Number(parseFloat(result.lat).toFixed(6));
    const newLng = Number(parseFloat(result.lon).toFixed(6));
    setLat(newLat);
    setLng(newLng);
    const mapped = gpsToMapCoords(newLat, newLng);
    setMapX(mapped.mapX ?? 50);
    setMapY(mapped.mapY ?? 50);
    setResolvedAddress(result.display_name);
    setShowDropdown(false);
    setSearchQuery(result.display_name.split(',')[0]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newLat, newLng], 16, { duration: 1.2 });
      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng]);
      }
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        latitude: lat,
        longitude: lng,
        mapX,
        mapY,
        location: resolvedAddress,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col transition-all duration-200 ${
          isFullscreen ? 'w-full h-full max-w-none rounded-none' : 'max-w-4xl w-full h-[88vh] max-h-[750px]'
        }`}
        onClick={() => setShowDropdown(false)}
      >
        {/* Top Header */}
        <div className="bg-slate-950 px-5 py-3.5 flex items-center justify-between border-b border-slate-800 gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight truncate">
                  Pick Facility Location
                </h2>
                {facilityName && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold truncate max-w-[160px]">
                    {facilityName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Search place or drag and drop the pin directly onto the map
              </p>
            </div>
          </div>

          {/* Search Box with Autocomplete */}
          <div className="relative flex-1 max-w-xs sm:max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Search city, street, or facility..."
                className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-medium placeholder:text-slate-500 outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {isSearching ? (
                <Loader2 size={13} className="absolute right-3 text-blue-400 animate-spin" />
              ) : (
                searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowDropdown(false);
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )
              )}
            </div>

            {/* Search Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.place_id || idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-start gap-2 border-b border-slate-800 last:border-0 transition-colors cursor-pointer"
                  >
                    <MapPin size={13} className="text-blue-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header Controls: Layer Switch, Fullscreen, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Layer Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => handleLayerSwitch('satellite')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  mapLayer === 'satellite'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Satellite Imagery"
              >
                🛰️ Satellite
              </button>
              <button
                type="button"
                onClick={() => handleLayerSwitch('streets')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  mapLayer === 'streets'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Street Map"
              >
                🗺️ Streets
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Map Body Container */}
        <div className="flex-1 relative overflow-hidden bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />

          {/* Quick Floating Action: Recenter to Pin */}
          <button
            type="button"
            onClick={handleCenterToPin}
            className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold border border-slate-700 shadow-xl backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer hover:border-blue-500"
            title="Recenter Map to Pin"
          >
            <LocateFixed size={14} className="text-blue-400" />
            <span>Center Pin</span>
          </button>
        </div>

        {/* Bottom Information Bar & Actions */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap shrink-0">
          {/* Resolved Address and Coordinates */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Detected Location
                </span>
                {isGeocoding && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-400">
                    <Loader2 size={10} className="animate-spin" /> Resolving address…
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-white truncate max-w-lg" title={resolvedAddress}>
                {resolvedAddress || 'Click map or drag pin to resolve location'}
              </p>
            </div>

            {/* GPS & Map Badges */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="text-slate-500 font-semibold mr-1">GPS:</span>
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="text-slate-500 font-semibold mr-1">Map:</span>
                X: {mapX}% • Y: {mapY}%
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
