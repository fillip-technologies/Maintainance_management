import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

/** Toast state for a layout — returns [toastNode, showToast]. */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const showToast = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast({ msg, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3800);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const node = toast && (
    <div
      key={toast.key}
      role="status"
      className="fixed bottom-5 right-5 z-[90] flex items-center gap-3 max-w-[420px] pl-3.5 pr-2 py-2.5 rounded-[12px] bg-[#16191e] text-[#eceef1] text-[13px] font-[520] shadow-[var(--shadow-pop)] border border-white/[0.06]"
      style={{ animation: 'fx-pop 200ms ease-out both' }}
    >
      <CheckCircle2 size={17} className="text-[#2fc276] shrink-0" />
      <span className="flex-1">{toast.msg}</span>
      <button onClick={() => setToast(null)} className="w-7 h-7 grid place-items-center rounded-md text-white/50 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
  return [node, showToast];
}
