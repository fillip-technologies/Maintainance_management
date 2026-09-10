import lionImg from '../../../../assets/locations/lion.jpg';
import deerImg from '../../../../assets/locations/deer.jpg';
import templeImg from '../../../../assets/locations/temple.jpg';
import tigerImg from '../../../../assets/locations/tiger.jpg';
import hillsImg from '../../../../assets/locations/hills.jpg';
import satelliteMapImg from '../../../../assets/locations/satellite_map.jpg';
import { CHART_PALETTE } from '../../../../tokens';

export { satelliteMapImg };

const PIN_COLORS = CHART_PALETTE;

export const OVERVIEW_LOCATIONS = [
  {
    id: 'zoo-safari',
    name: 'Zoo Safari',
    shortName: 'Zoo Safari',
    devices: 246,
    offline: 3,
    maintenance: 2,
    breakdownText: '3 Offline | 2 Maintenance',
    statusDot: 'red', // red dot indicates offline issues
    operationalStatus: 'Operational',
    bottomStatusColor: 'emerald',
    image: lionImg,
    pinColor: PIN_COLORS[0], // Red pin marker
    barColor: PIN_COLORS[0], // Red bar in chart
    pinX: 28, // % from left
    pinY: 62, // % from top
  },
  {
    id: 'nature-safari',
    name: 'Nature Safari',
    shortName: 'Nature Safari',
    devices: 198,
    offline: 0,
    maintenance: 0,
    breakdownText: 'All Online',
    statusDot: 'emerald',
    operationalStatus: 'Operational',
    bottomStatusColor: 'emerald',
    image: deerImg,
    pinColor: PIN_COLORS[3], // Blue pin marker
    barColor: PIN_COLORS[3], // Blue bar in chart
    pinX: 58,
    pinY: 53,
  },
  {
    id: 'venu-van',
    name: 'Venu Van',
    shortName: 'Venu Van',
    devices: 142,
    offline: 1,
    maintenance: 1,
    breakdownText: '1 Offline | 1 Maintenance',
    statusDot: 'emerald',
    operationalStatus: 'Operational',
    bottomStatusColor: 'emerald',
    image: templeImg,
    pinColor: PIN_COLORS[1], // Green pin marker
    barColor: PIN_COLORS[1], // Green bar in chart
    pinX: 36,
    pinY: 48,
  },
  {
    id: 'patna-zoo',
    name: 'Patna Zoo',
    shortName: 'Patna Zoo',
    devices: 324,
    offline: 0,
    maintenance: 0,
    breakdownText: 'All Online',
    statusDot: 'emerald',
    operationalStatus: 'Operational',
    bottomStatusColor: 'emerald',
    image: tigerImg,
    pinColor: PIN_COLORS[5], // Purple pin marker
    barColor: PIN_COLORS[5], // Purple bar in chart
    pinX: 24,
    pinY: 30,
  },
  {
    id: 'dfo-nalanda',
    name: 'DFO Nalanda Forest Areas',
    shortName: 'DFO Nalanda',
    devices: 336,
    offline: 5,
    maintenance: 22,
    breakdownText: '5 Offline | 22 Maintenance',
    statusDot: 'amber',
    operationalStatus: 'Partial Issues',
    bottomStatusColor: 'amber',
    image: hillsImg,
    pinColor: PIN_COLORS[3], // Orange pin marker
    barColor: PIN_COLORS[3], // Orange bar in chart
    pinX: 53,
    pinY: 70,
  },
];
