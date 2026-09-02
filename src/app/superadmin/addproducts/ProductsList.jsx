import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  Calendar,
  IndianRupee,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  X,
  Camera,
  Tv,
  Cable,
  Filter,
  RotateCcw
} from 'lucide-react';
import { getProducts, deleteProduct } from '../../api/productsApi';

export default function ProductsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateField, setDateField] = useState('purchaseDate'); // 'purchaseDate' or 'installationDate'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // productsApi already maps device rows to a unit shape.
  const normalize = (p) => ({
    id: p.id,
    code: p.code || '—',
    name: p.name,
    category: p.category || '—',
    companyName: p.companyName || '—',
    zoneName: p.zoneName,
    inStock: p.inStock,
    purchaseDate: p.purchaseDate || '',
    installationDate: p.installationDate || '',
    price: p.unitPrice != null ? Number(p.unitPrice) : 0,
    image: p.imageUrl || null
  });

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({ limit: 200 });
      setProducts((data?.items || []).map(normalize));
    } catch (err) {
      console.error('[ProductsList] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products by search, category, and date range
  const filteredProducts = products.filter((prd) => {
    const matchesSearch = prd.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || prd.category === categoryFilter;

    // Date range filter
    let matchesDate = true;
    const targetDate = prd[dateField];
    if (startDate && targetDate) {
      matchesDate = matchesDate && targetDate >= startDate;
    }
    if (endDate && targetDate) {
      matchesDate = matchesDate && targetDate <= endDate;
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Calculate dynamic stats
  const totalCameras = filteredProducts.filter((p) =>
    p.category?.toLowerCase().includes('camera')
  ).length;

  const totalDisplays = filteredProducts.filter(
    (p) =>
      p.category?.toLowerCase().includes('display') ||
      p.category?.toLowerCase().includes('tv') ||
      p.category?.toLowerCase().includes('video wall')
  ).length;

  const totalFiber = filteredProducts.filter(
    (p) =>
      p.category?.toLowerCase().includes('fiber') ||
      p.category?.toLowerCase().includes('cable') ||
      p.category?.toLowerCase().includes('networking')
  ).length;

  const totalValue = filteredProducts.reduce(
    (sum, p) => sum + (parseFloat(p.price) || 0),
    0
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from inventory?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product "${name}" removed from catalog.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete product.');
    }
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    showToast('Date range filter reset.');
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-200 relative">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap py-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Products & Hardware Inventory
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Real-time catalog of CCTV cameras, LED commercial displays, and fiber optics
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast('Exporting products list to CSV...')}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/superadmin/add-products')}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total CCTV Cameras */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total CCTV Cameras
            </span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalCameras}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-xs">
            <Camera size={22} />
          </div>
        </div>

        {/* Total Displays & TVs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Total Displays & TVs
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {totalDisplays}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-xs">
            <Tv size={22} />
          </div>
        </div>

        {/* Total Fiber Optics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Total Fiber Optics
            </span>
            <span className="text-3xl font-extrabold text-purple-600 tracking-tight">
              {totalFiber}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-purple-200 bg-purple-50 text-purple-600 shadow-xs">
            <Cable size={22} />
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Total Value (₹ INR)
            </span>
            <span className="text-2xl font-extrabold text-amber-600 tracking-tight">
              ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-amber-200 bg-amber-50 text-amber-600 shadow-xs">
            <IndianRupee size={22} />
          </div>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter size={15} className="text-indigo-600" />
            <span>Filter by Date Range:</span>
          </div>

          {/* Date Type Selector */}
          <select
            value={dateField}
            onChange={(e) => setDateField(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="purchaseDate">Purchase Date</option>
            <option value="installationDate">Installation Date</option>
          </select>

          {/* From Date */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 text-xs">
            <span className="text-slate-400 font-bold text-[11px] uppercase">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-slate-900 outline-hidden text-xs cursor-pointer font-medium"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 text-xs">
            <span className="text-slate-400 font-bold text-[11px] uppercase">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-slate-900 outline-hidden text-xs cursor-pointer font-medium"
            />
          </div>

          {/* Clear Dates Button */}
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleClearDateFilter}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Date Filter</span>
            </button>
          )}
        </div>

        {/* Filtered Count Badge */}
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> of <span className="font-bold text-slate-900">{products.length}</span> products
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">All Registered Products</h3>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
              {filteredProducts.length} Items
            </span>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 text-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search camera, TV, fiber..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-slate-900 outline-hidden w-48 sm:w-64 text-xs placeholder:text-slate-400"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Security & CCTV Cameras">Security & CCTV Cameras</option>
              <option value="Smart TVs & Displays">Smart TVs & Displays</option>
              <option value="Fiber Optics & Networking">Fiber Optics & Networking</option>
              <option value="LED Video Walls">LED Video Walls</option>
              <option value="Surveillance & NVR">Surveillance & NVR</option>
              <option value="AV Cables & Accessories">AV Cables & Accessories</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Unit Name & Image</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location / Zone</th>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4">Price (₹ INR)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">Loading inventory…</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No products found matching your search or date filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {prd.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {prd.image ? (
                            <img src={prd.image} alt={prd.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-slate-400" />
                          )}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {prd.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold whitespace-nowrap">
                      {prd.companyName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap">
                        {prd.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {prd.inStock ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">In stock</span>
                      ) : (
                        <span className="text-slate-700 font-medium">{prd.zoneName}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{prd.purchaseDate || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                      ₹{parseFloat(prd.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => showToast(`Editing product ${prd.name}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prd.id, prd.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
