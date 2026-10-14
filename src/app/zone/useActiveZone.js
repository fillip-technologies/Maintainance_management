import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'fixly_active_zone_id';

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * The zones a zone officer is assigned to, plus the one currently being viewed.
 * Falls back to the single `zoneId` for sessions stored before `zones` existed.
 */
export function useActiveZone() {
  const { currentUser } = useAuth();

  const zones = useMemo(() => {
    if (Array.isArray(currentUser?.zones) && currentUser.zones.length) return currentUser.zones;
    if (currentUser?.zoneId) {
      return [{ id: currentUser.zoneId, name: currentUser.zoneName ?? 'My Zone' }];
    }
    return [];
  }, [currentUser]);

  const [storedId, setStoredId] = useState(readStored);
  const activeZoneId = zones.some((z) => z.id === storedId) ? storedId : zones[0]?.id ?? null;

  const setActiveZoneId = useCallback((id) => {
    setStoredId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* storage unavailable — selection just won't persist */
    }
  }, []);

  return { zones, activeZoneId, setActiveZoneId };
}
