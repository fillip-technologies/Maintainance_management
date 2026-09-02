// No seed/demo products — the catalog starts empty and is populated only by
// real entries the user adds. (Previously this held 6 fabricated sample products
// with stock images and made-up prices, which showed as fake data on the page.)
export const initialProducts = [];

// Bumped the storage key so any previously-persisted demo products are dropped
// on next load instead of lingering in localStorage.
const STORAGE_KEY = 'fixly_products_data_v2';

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
