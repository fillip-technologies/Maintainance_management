import {
  Gauge, LayoutGrid, MapPinned, Camera, ClipboardList, CalendarCheck, Users, Building2,
  UserCog, Wrench, Boxes, Tag, ShieldAlert, TriangleAlert,
} from 'lucide-react';

/**
 * Role → navigation. Kept in one place so the rail, the top bar title and the
 * command palette always agree. Zone officers get their own minimal set — no
 * admin destinations can leak into their nav.
 */
export function navFor(role) {
  if (role === 'super_admin') {
    return [
      {
        group: 'Monitor',
        items: [
          { name: 'Overview', path: '/superadmin/overview', icon: Gauge, hint: 'Platform health at a glance' },
          { name: 'Equipment board', path: '/superadmin/board', icon: LayoutGrid, hint: 'Every device, by location and type' },
          { name: 'Issues & defects', path: '/superadmin/issues', icon: TriangleAlert, hint: 'All complaints and their stage' },
        ],
      },
      {
        group: 'Setup',
        items: [
          { name: 'Organizations', path: '/superadmin/organizations', icon: Building2, hint: 'Companies on the platform' },
          { name: 'Clients', path: '/superadmin/clients', icon: Users, hint: 'Client accounts and admins' },
          { name: 'Zones', path: '/superadmin/zones', icon: MapPinned, hint: 'Locations and areas' },
          { name: 'Technicians', path: '/superadmin/technicians', icon: Wrench, hint: 'Field engineers and coverage' },
          { name: 'Team', path: '/superadmin/team', icon: UserCog, hint: 'Platform users' },
        ],
      },
      {
        group: 'Catalog',
        items: [
          { name: 'Inventory', path: '/superadmin/products', icon: Boxes, hint: 'Units in stock and deployed' },
          { name: 'Product categories', path: '/superadmin/categories', icon: Tag, hint: 'Equipment types' },
          { name: 'Defect categories', path: '/superadmin/defect-categories', icon: ShieldAlert, hint: 'Problem types per equipment' },
        ],
      },
    ];
  }

  if (role === 'zone_incharge' || role === 'zone_staff') {
    return [
      {
        group: 'My location',
        items: [
          { name: 'Overview', path: '/zone/overview', icon: Gauge, hint: 'Your location at a glance' },
          { name: 'Equipment board', path: '/zone/board', icon: LayoutGrid, hint: 'Every device at your location' },
          { name: 'Daily check', path: '/zone/daily-logs', icon: CalendarCheck, hint: 'Mark today\'s equipment status' },
          { name: 'Raise & track', path: '/zone/requests', icon: ClipboardList, hint: 'Report a problem, follow repairs' },
          { name: 'My team', path: '/zone/team', icon: Users, hint: 'People at your location' },
        ],
      },
    ];
  }

  // client_admin (and technician, which is still bucketed in /clientadmin)
  return [
    {
      group: 'Monitor',
      items: [
        { name: 'Overview', path: '/clientadmin/overview', icon: Gauge, hint: 'All your locations at a glance' },
        { name: 'Equipment board', path: '/clientadmin/board', icon: LayoutGrid, hint: 'Every device, by location and type' },
        { name: 'Locations', path: '/clientadmin/zones', icon: MapPinned, hint: 'Zones, areas and their health' },
        { name: 'Connectivity', path: '/clientadmin/products', icon: Camera, hint: 'Live connectivity and alerts' },
      ],
    },
    {
      group: 'Work',
      items: [
        { name: 'Raise & track', path: '/clientadmin/requests', icon: ClipboardList, hint: 'Report a problem, follow repairs' },
        { name: 'Daily checks', path: '/clientadmin/daily-logs', icon: CalendarCheck, hint: 'Who checked what, today' },
      ],
    },
    {
      group: 'People',
      items: [
        { name: 'Team & roles', path: '/clientadmin/users', icon: Users, hint: 'Zone officers, staff, access' },
      ],
    },
  ];
}

export const ROLE_LABEL = {
  super_admin: 'Platform admin',
  client_admin: 'Client admin',
  zone_incharge: 'Location in-charge',
  zone_staff: 'Location staff',
  technician: 'Technician',
};

/** Best nav match for a pathname (longest prefix wins). */
export function currentNavItem(role, pathname) {
  let best = null;
  for (const g of navFor(role)) {
    for (const item of g.items) {
      if (pathname === item.path || pathname.startsWith(item.path + '/')) {
        if (!best || item.path.length > best.path.length) best = { ...item, group: g.group };
      }
    }
  }
  return best;
}

export const COMMAND_EVENT = 'fixly:command';

/** Open the ⌘K palette from anywhere (e.g. the top-bar search button). */
export const openCommandPalette = () => window.dispatchEvent(new Event(COMMAND_EVENT));

/** Where the equipment board lives for a role. */
export function boardBaseFor(role) {
  if (role === 'super_admin') return '/superadmin/board';
  if (role === 'zone_incharge' || role === 'zone_staff') return '/zone/board';
  return '/clientadmin/board';
}
