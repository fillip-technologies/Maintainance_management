import {
  Cctv, HardDrive, Network, Router, LampWallUp, SolarPanel, Tv, Megaphone, Ticket,
  BatteryCharging, Computer, Phone, Fingerprint, Cable, Server, Box,
} from 'lucide-react';

/**
 * Equipment-type → line icon. Category names are free text in the DB, so this
 * matches on keywords. One consistent icon family keeps the boards calm and
 * readable for low-literacy users (icon + one word).
 */
const RULES = [
  [['nvr', 'dvr', 'recorder', 'storage', 'hdd'], HardDrive],
  [['cctv', 'camera', 'cam', 'ptz', 'dome', 'bullet', 'anpr'], Cctv],
  [['switch', 'lan', 'poe'], Network],
  [['router', 'gateway', 'wifi', 'wi-fi', 'access point'], Router],
  [['fiber', 'fibre', 'optical', 'cable', 'link'], Cable],
  [['street', 'light', 'lamp', 'pole'], LampWallUp],
  [['solar', 'inverter', 'panel'], SolarPanel],
  [['led', 'display', 'screen', 'tv', 'video wall', 'monitor'], Tv],
  [['pa ', 'pa system', 'public address', 'announcement', 'speaker', 'amplifier', 'audio'], Megaphone],
  [['kiosk', 'ticket'], Ticket],
  [['ups', 'battery', 'power'], BatteryCharging],
  [['computer', 'pc', 'desktop', 'laptop', 'workstation'], Computer],
  [['pbx', 'epabx', 'phone', 'telephone', 'intercom'], Phone],
  [['access', 'biometric', 'door', 'turnstile', 'gate'], Fingerprint],
  [['server', 'rack', 'command'], Server],
];

export function categoryIcon(name = '') {
  const n = ` ${String(name).toLowerCase()} `;
  for (const [keys, Icon] of RULES) {
    if (keys.some((k) => n.includes(k))) return Icon;
  }
  return Box;
}

/** Short, one-word label for tabs and tiles ("CCTV Camera" → "CCTV"). */
export function categoryShort(name = '') {
  const n = String(name).trim();
  if (!n) return 'Other';
  if (/cctv|camera/i.test(n)) return 'CCTV';
  if (/nvr|dvr|recorder/i.test(n)) return 'NVR';
  if (/street\s*light/i.test(n)) return 'Lights';
  if (/led|display|screen/i.test(n)) return 'LED';
  if (/\bpa\b|public address|announcement/i.test(n)) return 'PA';
  if (/kiosk/i.test(n)) return 'Kiosks';
  if (/ups/i.test(n)) return 'UPS';
  if (/switch/i.test(n)) return 'Switches';
  if (/computer|\bpc\b/i.test(n)) return 'Computers';
  return n.split(/\s+/)[0];
}
