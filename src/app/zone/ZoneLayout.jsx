import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../ui/AppShell';
import { useToast } from '../ui/useToast';
import { useRaiseProblem } from '../ui/useRaiseProblem';

/**
 * Layout shell for the Zone Officer area. Uses the shared AppShell; the rail
 * picks the zone-only menu from the user's role, so no client-admin
 * destinations (user management, client-wide views) can appear here. Every
 * read is scoped to the officer's assigned zones by the backend.
 */
export default function ZoneLayout() {
  const [toastNode, showToast] = useToast();
  const [raiseModal, openRaise] = useRaiseProblem(showToast);

  return (
    <AppShell onRaiseProblem={() => openRaise()} overlay={<>{raiseModal}{toastNode}</>}>
      <Outlet context={{ onOpenRequestModal: openRaise, showToast }} />
    </AppShell>
  );
}
