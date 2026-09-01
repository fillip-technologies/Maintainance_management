import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

export default function ImageUploader({ image, setImage }) {
  const [isDragging, setIsDragging] = useState(false);

  const sampleImages = [
    {
      name: '4K CCTV Camera',
      url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&auto=format&fit=crop&q=60'
    },
    {
      name: 'Smart TV Display',
      url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&auto=format&fit=crop&q=60'
    },
    {
      name: 'Fiber Optic Cable',
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=60'
    },
    {
      name: 'LED Video Wall',
      url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=60'
    }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImage(URL.createObjectURL(file));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-xs font-bold text-slate-700">
        Product / Hardware Image
      </label>

      {image ? (
        <div className="relative w-full h-48 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center group">
          <img
            src={image}
            alt="Product Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setImage(null)}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
            >
              <X size={14} />
              <span>Remove Photo</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-3">
            <UploadCloud size={24} />
          </div>
          <span className="text-xs font-bold text-slate-900 mb-1">
            Drag & drop hardware photo or <label className="text-indigo-600 hover:underline cursor-pointer">browse file<input type="file" accept="image/*" onChange={handleFileInput} className="hidden" /></label>
          </span>
          <span className="text-[11px] text-slate-400">
            PNG, JPG, WEBP up to 5MB
          </span>

          {/* Quick preset thumbnail picker */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 w-full flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Or pick preset hardware thumbnail
            </span>
            <div className="flex gap-2.5">
              {sampleImages.map((samp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(samp.url)}
                  className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden hover:scale-105 hover:border-indigo-400 transition-all cursor-pointer relative shadow-xs"
                  title={samp.name}
                >
                  <img src={samp.url} alt={samp.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
