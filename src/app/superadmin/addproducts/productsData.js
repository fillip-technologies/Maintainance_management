export const initialProducts = [
  {
    id: 1,
    name: '4K Ultra HD PTZ Outdoor Dome Security Camera',
    serialNumber: 'SN-CAM-90481234',
    category: 'Security & CCTV Cameras',
    purchaseDate: '2026-07-10',
    installationDate: '2026-07-15',
    price: 38500.00,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    name: '75" 4K UHD Commercial Smart Display & Conference TV',
    serialNumber: 'SN-DIS-81920341',
    category: 'Smart TVs & Displays',
    purchaseDate: '2026-06-20',
    installationDate: '2026-06-28',
    price: 135000.00,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    name: 'Single Mode Armored Fiber Optic Cable (1000m Reel)',
    serialNumber: 'SN-FIB-77291045',
    category: 'Fiber Optics & Networking',
    purchaseDate: '2026-08-01',
    installationDate: '2026-08-05',
    price: 72000.00,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    name: 'AI Smart Night-Vision Bullet Camera (PoE)',
    serialNumber: 'SN-CAM-34019283',
    category: 'Security & CCTV Cameras',
    purchaseDate: '2026-07-25',
    installationDate: '2026-08-02',
    price: 24500.00,
    image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 5,
    name: '55" Ultra-Slim OLED Video Wall Panel Display',
    serialNumber: 'SN-DIS-60291147',
    category: 'Smart TVs & Displays',
    purchaseDate: '2026-05-14',
    installationDate: '2026-05-22',
    price: 175000.00,
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 6,
    name: '24-Port Duplex LC Optical Fiber Patch Panel',
    serialNumber: 'SN-FIB-19284019',
    category: 'Fiber Optics & Networking',
    purchaseDate: '2026-08-10',
    installationDate: '2026-08-14',
    price: 22500.00,
    image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&auto=format&fit=crop&q=60'
  }
];

const STORAGE_KEY = 'fixly_products_data_inr_v1';

export const getStoredProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse stored products', err);
  }
  return initialProducts;
};

export const saveStoredProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save stored products', err);
  }
};
