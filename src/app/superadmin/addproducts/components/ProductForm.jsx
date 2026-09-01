import React from 'react';
import {
  Tag,
  Hash,
  Layers,
  Calendar,
  IndianRupee,
  CheckCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function ProductForm({
  formData,
  setFormData,
  image,
  setImage,
  onSubmit,
  onReset,
  isSubmitting
}) {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateSerial = () => {
    let prefix = 'DEV';
    if (formData.category?.includes('Camera')) prefix = 'CAM';
    else if (formData.category?.includes('TV') || formData.category?.includes('Display')) prefix = 'DIS';
    else if (formData.category?.includes('Fiber')) prefix = 'FIB';
    else if (formData.category?.includes('LED')) prefix = 'LED';

    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    handleChange('serialNumber', `SN-${prefix}-${randomNum}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Product Details Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Tag size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Product & Equipment Details</h3>
              <p className="text-xs text-slate-500">Enter device specs, model serials, and deployment dates</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Product Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 4K Ultra HD PTZ Outdoor Dome Security Camera"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-hidden transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* 2. Serial Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Serial Number *
              </label>
              <button
                type="button"
                onClick={handleGenerateSerial}
                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={11} />
                <span>Auto-Generate</span>
              </button>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2">
              <Hash size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                required
                placeholder="e.g., SN-CAM-90481234"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                className="w-full bg-transparent font-mono text-xs font-bold text-slate-900 outline-hidden placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 3. Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category *
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2">
              <Layers size={16} className="text-slate-400 shrink-0" />
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-hidden cursor-pointer"
              >
                <option value="Security & CCTV Cameras">Security & CCTV Cameras</option>
                <option value="Smart TVs & Displays">Smart TVs & Displays</option>
                <option value="Fiber Optics & Networking">Fiber Optics & Networking</option>
                <option value="LED Video Walls">LED Video Walls</option>
                <option value="Surveillance & NVR">Surveillance & NVR</option>
                <option value="AV Cables & Accessories">AV Cables & Accessories</option>
              </select>
            </div>
          </div>

          {/* 4. Purchase Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Purchase Date *
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Installation Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Installation Date *
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2">
              <Calendar size={16} className="text-indigo-600 shrink-0" />
              <input
                type="date"
                required
                value={formData.installationDate}
                onChange={(e) => handleChange('installationDate', e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* 6. Price in INR */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Price (₹ INR) *
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 gap-2">
              <IndianRupee size={18} className="text-emerald-600 shrink-0" />
              <input
                type="number"
                step="1"
                required
                placeholder="e.g., 38500"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-hidden placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* 7. Image Upload */}
        <ImageUploader image={image} setImage={setImage} />
      </div>

      {/* Action Buttons Bar */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Reset Form</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Adding Product...</span>
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              <span>Save & Add Product</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
