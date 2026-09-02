import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
  X
} from 'lucide-react';
import ProductForm from './components/ProductForm';
import ProductPreviewCard from './components/ProductPreviewCard';
import { createProduct } from '../../api/productsApi';
import { getCompanies } from '../../api/companiesApi';

const initialFormData = {
  companyId: '',
  name: '',
  category: 'Security & CCTV Cameras',
  quantity: '',
  purchaseDate: '',
  installationDate: '',
  price: ''
};

export default function AddProducts() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [productImage, setProductImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [companies, setCompanies] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Super admin must pick an organization — load the list for the selector.
  useEffect(() => {
    getCompanies({ limit: 100 })
      .then((data) => setCompanies(data?.items || []))
      .catch((err) => console.error('[AddProducts] load companies:', err.message));
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (!formData.companyId) {
      showToast('Please select an organization first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct({
        companyId: formData.companyId,
        name: formData.name.trim(),
        category: formData.category || undefined,
        quantity: Number(formData.quantity) || 0,
        unitPrice: formData.price ? Number(formData.price) : undefined,
        purchaseDate: formData.purchaseDate || undefined,
        installationDate: formData.installationDate || undefined,
        imageUrl: productImage || undefined
      });
      navigate('/superadmin/products');
    } catch (err) {
      showToast(err.message || 'Failed to add product.');
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData(initialFormData);
    setProductImage(null);
    showToast('Form cleared.');
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

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap py-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/superadmin/products')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Back to Products"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Register product name, serial number, category, purchase/installation dates, price in INR (₹), and image
            </p>
          </div>
        </div>

        {/* Back and Import Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast('CSV Template with required INR product fields downloaded.')}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Bulk CSV Import</span>
          </button>
        </div>
      </div>

      {/* 2-Column Form & Live Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2">
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            image={productImage}
            setImage={setProductImage}
            onSubmit={handleFormSubmit}
            onReset={handleResetForm}
            isSubmitting={isSubmitting}
            companies={companies}
          />
        </div>

        {/* Right 1 Col: Live Product Preview Card */}
        <div className="lg:col-span-1">
          <ProductPreviewCard formData={formData} image={productImage} />
        </div>
      </div>
    </div>
  );
}
