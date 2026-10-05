import React, { useCallback, useState } from 'react';
import RaiseQueryModal from '../common/RaiseQueryModal';

/**
 * Shared "raise a problem" modal state for a layout. `open()` may be called
 * straight from an onClick (the event is ignored) or with
 * `{ zoneId, categoryId }` to pre-fill where/what is broken.
 */
export function useRaiseProblem(showToast) {
  const [req, setReq] = useState(null);

  const open = useCallback((opts) => {
    const isPrefill = opts && typeof opts === 'object' && !('nativeEvent' in opts) && ('zoneId' in opts || 'categoryId' in opts);
    setReq(isPrefill ? { zoneId: opts.zoneId ?? null, categoryId: opts.categoryId ?? null } : {});
  }, []);

  const handleCreated = (issues) => {
    const count = Array.isArray(issues) ? issues.length : 1;
    const unit = (Array.isArray(issues) ? issues[0] : issues)?.device?.name || 'unit';
    showToast?.(count > 1
      ? `${count} defects raised — units are now under maintenance.`
      : `Defect raised on ${unit} — the unit is now under maintenance.`);
    // Let any open list (e.g. the Requests page) refresh without a socket round-trip.
    window.dispatchEvent(new CustomEvent('fixly:issue_created'));
  };

  const modal = (
    <RaiseQueryModal
      key={req ? `${req.zoneId ?? ''}:${req.categoryId ?? ''}` : 'closed'}
      isOpen={!!req}
      initialZoneId={req?.zoneId || undefined}
      initialProductCategoryId={req?.categoryId || undefined}
      onClose={() => setReq(null)}
      onCreated={handleCreated}
    />
  );

  return [modal, open];
}
