import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Video, AlertTriangle, Plus, Image } from 'lucide-react';

const MAX_FILES = 10;
const MAX_MB    = 100;
const ACCEPT    = 'image/*,video/*';

function validate(incoming, existing) {
  const combined = [...existing, ...incoming];
  if (combined.length > MAX_FILES)
    return { ok: false, error: `You can attach up to ${MAX_FILES} files.` };
  const big = incoming.find((f) => f.size > MAX_MB * 1024 * 1024);
  if (big) return { ok: false, error: `"${big.name}" is over the ${MAX_MB} MB limit.` };
  const bad = incoming.find((f) => !f.type.startsWith('image/') && !f.type.startsWith('video/'));
  if (bad) return { ok: false, error: `"${bad.name}" is not an image or video.` };
  return { ok: true, combined };
}

function FileThumb({ file, onRemove, disabled }) {
  const isVideo = file.type.startsWith('video/');
  const url = URL.createObjectURL(file);
  const mb = (file.size / 1024 / 1024).toFixed(1);
  return (
    <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex-shrink-0 shadow-xs">
      {isVideo ? (
        <video src={url} className="w-full h-full object-cover" muted />
      ) : (
        <img src={url} alt={file.name} className="w-full h-full object-cover" />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center gap-1 p-1">
        {!disabled && (
          <button
            type="button"
            onClick={() => onRemove(file)}
            className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow"
          >
            <X size={13} />
          </button>
        )}
        <span className="text-[9px] text-white font-semibold text-center leading-tight px-1 truncate w-full text-center">
          {mb} MB
        </span>
      </div>

      {/* Type badge */}
      <div className={`absolute top-1 left-1 w-5 h-5 rounded-lg flex items-center justify-center ${isVideo ? 'bg-violet-600' : 'bg-indigo-600'} shadow`}>
        {isVideo ? <Video size={10} className="text-white" /> : <Image size={10} className="text-white" />}
      </div>

      {/* Remove button always visible on mobile */}
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(file)}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center group-hover:hidden"
        >
          <X size={9} />
        </button>
      )}
    </div>
  );
}

export default function AttachmentPicker({ files = [], onFilesChange, disabled = false }) {
  const inputRef  = useRef(null);
  const [error, setError]     = useState('');
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback((incoming) => {
    setError('');
    const list = Array.from(incoming).filter(Boolean);
    const { ok, combined, error: err } = validate(list, files);
    if (!ok) { setError(err); return; }
    onFilesChange(combined);
    if (inputRef.current) inputRef.current.value = '';
  }, [files, onFilesChange]);

  const onInputChange  = (e) => addFiles(e.target.files ?? []);
  const removeFile = (target) => { onFilesChange(files.filter((f) => f !== target)); setError(''); };

  const onDragOver  = (e) => { e.preventDefault(); if (!disabled) setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  };

  const remaining = MAX_FILES - files.length;
  const full      = files.length >= MAX_FILES;

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Upload size={12} className="text-slate-500" />
          Photos &amp; Videos
          <span className="text-[10px] font-normal text-slate-400 ml-1">— optional</span>
        </label>
        <span className="text-[10px] font-semibold text-slate-400">
          {files.length}/{MAX_FILES} · max {MAX_MB} MB each
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && !full && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-3
          ${dragging
            ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
            : full
            ? 'border-slate-200 bg-slate-50/60 cursor-default'
            : disabled
            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
            : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer'
          }`}
      >
        {/* Previews grid */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((f, i) => (
              <FileThumb key={i} file={f} onRemove={removeFile} disabled={disabled} />
            ))}

            {/* Inline add-more tile */}
            {!full && !disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 flex flex-col items-center justify-center gap-1 transition-colors flex-shrink-0 group"
              >
                <Plus size={20} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-indigo-500">Add more</span>
                <span className="text-[9px] text-indigo-400">{remaining} left</span>
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-5 gap-2 pointer-events-none">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-indigo-100' : 'bg-slate-100'}`}>
              <Upload size={20} className={dragging ? 'text-indigo-600' : 'text-slate-400'} />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-600">
                {dragging ? 'Drop to attach' : 'Click or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Images &amp; videos · up to {MAX_FILES} files · {MAX_MB} MB each
              </p>
            </div>
          </div>
        )}

        {/* Full state label */}
        {full && (
          <p className="text-[11px] text-slate-400 font-medium text-center py-1">
            Maximum {MAX_FILES} files attached — remove one to add another.
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        disabled={disabled || full}
        className="hidden"
        onChange={onInputChange}
      />

      {/* Error */}
      {error && (
        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1.5">
          <AlertTriangle size={11} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
