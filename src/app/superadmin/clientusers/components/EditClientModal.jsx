import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, User, MapPin, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { updateUser } from '../../../api/usersApi';
import { updateClient, uploadClientImage } from '../../../api/clientsApi';
import MapLocationPreviewField from '../../../common/components/MapLocationPreviewField';
import { MAP_PIN_DEFAULT } from '../../../../tokens';

export default function EditClientModal({ isOpen, client, onClose, onUpdated, onDelete }) {
  if (!isOpen || !client) return null;

  const [formData, setFormData] = useState({
    facilityName: client.facilityName || client.name || '',
    adminName: client.adminName || client.name || '',
    location: client.location || '',
    latitude: client.latitude != null ? String(client.latitude) : '',
    longitude: client.longitude != null ? String(client.longitude) : '',
    mapX: client.mapX != null ? String(client.mapX) : '',
    mapY: client.mapY != null ? String(client.mapY) : '',
    accountStatus: client.accountStatus || client.status || 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(client.imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (client) {
      setFormData({
        facilityName: client.facilityName || client.name || '',
        adminName: client.adminName || client.name || '',
        location: client.location || '',
        latitude: client.latitude != null ? String(client.latitude) : '',
        longitude: client.longitude != null ? String(client.longitude) : '',
        mapX: client.mapX != null ? String(client.mapX) : '',
        mapY: client.mapY != null ? String(client.mapY) : '',
        accountStatus: client.accountStatus || client.status || 'active'
      });
      setImageFile(null);
      setImagePreview(client.imageUrl || null);
      setRemoveImage(false);
      setErrorMsg(null);
    }
  }, [client]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      let updatedImageUrl = client.imageUrl || null;
      if (removeImage) updatedImageUrl = null;

      // 1. Update Client facility record
      const clientPayload = {
        name: formData.facilityName.trim(),
        facilityName: formData.facilityName.trim(),
        location: formData.location.trim() || null,
        imageUrl: updatedImageUrl,
        latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : null,
        mapX: formData.mapX !== '' ? Number(formData.mapX) : null,
        mapY: formData.mapY !== '' ? Number(formData.mapY) : null,
      };

      if (client.clientId) {
        await updateClient(client.clientId, clientPayload);
      }

      // If a new image file was selected, upload directly to Cloudinary
      if (imageFile && client.clientId) {
        try {
          const uploadRes = await uploadClientImage(client.clientId, imageFile);
          if (uploadRes?.imageUrl) {
            updatedImageUrl = uploadRes.imageUrl;
            clientPayload.imageUrl = uploadRes.imageUrl;
          }
        } catch (uploadErr) {
          console.error('Failed to upload image to Cloudinary:', uploadErr);
        }
      }

      // 2. Update Admin User record (if client has an associated user account)
      if (client.id) {
        await updateUser(client.id, {
          name: formData.adminName.trim(),
          role: 'client_admin',
          accountStatus: formData.accountStatus
        });
      }

      onUpdated({
        ...client,
        ...clientPayload,
        imageUrl: updatedImageUrl,
        adminName: formData.adminName.trim(),
        accountStatus: formData.accountStatus
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    onClose();
    onDelete(client);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[var(--bg-card)] rounded-3xl shadow-2xl max-w-lg w-full border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Client &amp; Facility</h2>
              <p className="text-xs text-slate-400">{client.email || 'No user account assigned'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Organization — read-only, fixed at creation */}
          {client.companyName && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-200">Organization</label>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
                <Building2 size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-300">{client.companyName}</span>
                <span className="ml-auto text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Fixed</span>
              </div>
            </div>
          )}

          {/* Facility / Campus Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-200">
              Facility / Campus Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Building2 size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.facilityName}
                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-white text-xs font-medium placeholder:text-slate-500 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
          </div>

          {/* Client Admin Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-200">
              Client Admin Name {client.id && <span className="text-rose-400">*</span>}
            </label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required={!!client.id}
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                placeholder={client.id ? 'Admin full name' : 'No user assigned'}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-white text-xs font-medium placeholder:text-slate-500 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-200">Location / City</label>
            <div className="relative flex items-center">
              <MapPin size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Dallas, TX or Plant #4"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-white text-xs font-medium placeholder:text-slate-500 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
          </div>

          {/* Facility Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-200">
              Facility Image <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl border-2 border-dashed border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-main)] hover:border-slate-600 cursor-pointer transition-colors shrink-0 overflow-hidden group/img relative"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Facility Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <ImageIcon size={22} className="text-slate-500 group-hover/img:text-indigo-400 transition-colors" />
                )}
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Upload size={13} /> {imagePreview ? 'Change Image' : 'Upload Image'}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {imageFile ? (
                  <p className="text-[11px] text-slate-400 truncate" title={imageFile.name}>
                    {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                  </p>
                ) : imagePreview ? (
                  <p className="text-[11px] text-slate-400">Current Cloudinary image active</p>
                ) : (
                  <p className="text-[11px] text-slate-400">PNG, JPG, or WEBP. Uploads to Cloudinary.</p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Map Location & Visual GPS Placement */}
          <MapLocationPreviewField
            mapX={formData.mapX}
            mapY={formData.mapY}
            latitude={formData.latitude}
            longitude={formData.longitude}
            location={formData.location}
            pinColor={client.pinColor || MAP_PIN_DEFAULT}
            facilityName={formData.facilityName || client.name}
            onChange={(coords) =>
              setFormData((prev) => ({
                ...prev,
                mapX: coords.mapX != null ? String(coords.mapX) : prev.mapX,
                mapY: coords.mapY != null ? String(coords.mapY) : prev.mapY,
                latitude: coords.latitude != null ? String(coords.latitude) : prev.latitude,
                longitude: coords.longitude != null ? String(coords.longitude) : prev.longitude,
                location: coords.location ? coords.location : prev.location,
              }))
            }
          />

          {/* Account Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-200">Account Access Status</label>
            <select
              value={formData.accountStatus}
              onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
              className="px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-white text-xs font-medium outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
            >
              <option value="active" className="bg-slate-900 text-white">Active (Operational Access)</option>
              <option value="suspended" className="bg-slate-900 text-white">Suspended (Access Blocked)</option>
              <option value="invited" className="bg-slate-900 text-white">Invited (Pending Confirmation)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] mt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 border border-rose-800/60 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Remove Client</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
