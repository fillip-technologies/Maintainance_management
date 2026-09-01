// Mock API service layer for Client Admin operations

export const clientFacilityData = {
  facilityId: 'site-1',
  facilityName: 'Apex Tech Tower - Campus A',
  clientOrganization: 'Apex Commercial Estates Ltd.',
  location: 'Tower 4, Electronic City Phase 1, Bengaluru',
  slaTier: 'Platinum 24/7 Enterprise SLA',
  assignedAccountManager: 'Sarah Jenkins (Fixly Ops)',
  emergencyContact: '+91 98450 11223',
  facilityStats: {
    activeTickets: 8,
    criticalOpen: 1,
    monitoredAssets: 34,
    assetsOnline: 32,
    monthlySpendInr: 185000,
    annualBudgetInr: 2500000,
    slaUptimePercent: 99.4,
    lastAuditDate: '24 Aug 2026'
  },
  
  tickets: [
    {
      id: 'TCK-8821',
      title: 'HVAC Chiller Unit 2 Cooling Efficiency Drop',
      category: 'HVAC & Climate',
      asset: 'Chiller Unit #2 (Floor 8)',
      priority: 'High',
      status: 'In Progress',
      assignedTech: 'Rahul Verma (Lead HVAC)',
      createdAt: 'Today, 08:30 AM',
      eta: 'Today, 02:00 PM',
      costEstimate: '₹14,500'
    },
    {
      id: 'TCK-8819',
      title: 'Passenger Elevator #3 Leveling Calibration',
      category: 'Elevators & Mobility',
      asset: 'Schindler Express Lift B',
      priority: 'Critical',
      status: 'In Progress',
      assignedTech: 'Arun Nair (Senior Elevator Tech)',
      createdAt: 'Today, 07:15 AM',
      eta: 'Today, 12:30 PM',
      costEstimate: '₹8,200'
    },
    {
      id: 'TCK-8804',
      title: 'Backup Diesel Generator 500kVA Quarterly PM',
      category: 'Power & Electrical',
      asset: 'Cummins DG Set 1',
      priority: 'Medium',
      status: 'Scheduled',
      assignedTech: 'Fixly Energy Fleet Team',
      createdAt: 'Yesterday',
      eta: 'Tomorrow, 10:00 AM',
      costEstimate: '₹22,000'
    },
    {
      id: 'TCK-8780',
      title: 'Fire Safety Hydrant Valve Pressure Testing',
      category: 'Fire Safety',
      asset: 'Basement Hydrant Ring',
      priority: 'Low',
      status: 'Resolved',
      assignedTech: 'Manoj Kumar',
      createdAt: '28 Aug 2026',
      eta: 'Completed',
      costEstimate: '₹6,400'
    },
    {
      id: 'TCK-8762',
      title: 'Access Control Turnstile Optical Sensor Replace',
      category: 'Security & Access',
      asset: 'Main Lobby Gate 2',
      priority: 'Medium',
      status: 'Resolved',
      assignedTech: 'Pooja Sharma',
      createdAt: '26 Aug 2026',
      eta: 'Completed',
      costEstimate: '₹4,500'
    }
  ],

  assets: [
    {
      id: 'AST-APX-01',
      name: 'York Central Water Chiller 450 TR',
      location: 'Roof Plant Room',
      category: 'HVAC',
      status: 'Attention Needed',
      statusType: 'warning',
      healthScore: 78,
      lastServiced: '12 Aug 2026',
      nextPM: '12 Sep 2026',
      warranty: 'Under Fixly Comprehensive AMC'
    },
    {
      id: 'AST-APX-02',
      name: 'Cummins 500 kVA Diesel Generator #1',
      location: 'Basement 2 Power Bay',
      category: 'Power Systems',
      status: 'Operational',
      statusType: 'success',
      healthScore: 96,
      lastServiced: '20 Jul 2026',
      nextPM: '02 Sep 2026',
      warranty: 'OEM Warranty Active'
    },
    {
      id: 'AST-APX-03',
      name: 'Schindler 18-Passenger High Speed Lift A',
      location: 'Tower Core North',
      category: 'Mobility',
      status: 'Operational',
      statusType: 'success',
      healthScore: 92,
      lastServiced: '18 Aug 2026',
      nextPM: '18 Sep 2026',
      warranty: 'Under Fixly AMC'
    },
    {
      id: 'AST-APX-04',
      name: 'Grundfos High Pressure Fire Sprinkler Pump',
      location: 'Basement 1 Pump Room',
      category: 'Fire Safety',
      status: 'Operational',
      statusType: 'success',
      healthScore: 99,
      lastServiced: '24 Aug 2026',
      nextPM: '24 Nov 2026',
      warranty: 'Certified Compliant'
    }
  ],

  pmSchedule: [
    {
      id: 'PMS-101',
      title: 'DG Set 1 & 2 Full Load & Battery Testing',
      date: 'Tomorrow, Sep 2',
      time: '10:00 AM - 01:00 PM',
      team: 'Fixly Electrical Specialists (2 Technicians)',
      type: 'Preventive Maintenance',
      badge: 'Upcoming'
    },
    {
      id: 'PMS-102',
      title: 'Air Handling Units (AHU) Filters Replacement (Floors 1-6)',
      date: 'Sep 6, 2026',
      time: '08:00 AM - 12:00 PM',
      team: 'Fixly HVAC Crew',
      type: 'Routine Servicing',
      badge: 'Scheduled'
    },
    {
      id: 'PMS-103',
      title: 'Fire Alarm Smoke Detectors & Sounder Audit',
      date: 'Sep 14, 2026',
      time: '02:00 PM - 05:00 PM',
      team: 'Fire Safety Compliance Inspector',
      type: 'Safety Compliance',
      badge: 'Scheduled'
    }
  ],

  invoices: [
    {
      invoiceNo: 'INV-2026-088',
      period: 'August 2026',
      description: 'Monthly Comprehensive Facility AMC & Telemetry Support',
      amountInr: 125000,
      status: 'Paid',
      date: '28 Aug 2026'
    },
    {
      invoiceNo: 'INV-2026-079',
      period: 'August 2026',
      description: 'HVAC Chiller Filter & Refrigerant Refill Parts (WO #8731)',
      amountInr: 28400,
      status: 'Paid',
      date: '15 Aug 2026'
    },
    {
      invoiceNo: 'INV-2026-092',
      period: 'September 2026',
      description: 'Quarterly High-Tension Transformer Oil Filtration Service',
      amountInr: 31600,
      status: 'Due Soon',
      date: 'Due Sep 10, 2026'
    }
  ]
};

// API Helper Functions (Can easily be replaced with fetch/axios to actual backend)
export const getClientOverviewData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clientFacilityData);
    }, 100);
  });
};

export const createClientTicket = (ticketPayload) => {
  return new Promise((resolve) => {
    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: ticketPayload.title,
      category: ticketPayload.category || 'General Maintenance',
      asset: ticketPayload.asset || 'Facility Asset',
      priority: ticketPayload.priority || 'Medium',
      status: 'In Progress',
      assignedTech: 'Fixly Rapid Response Team',
      createdAt: 'Just now',
      eta: 'Within 4 hours',
      costEstimate: 'Pending Inspection'
    };
    clientFacilityData.tickets.unshift(newTicket);
    clientFacilityData.facilityStats.activeTickets += 1;
    resolve(newTicket);
  });
};
