import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../ui/AppShell';
import { useToast } from '../ui/useToast';
import { useRaiseProblem } from '../ui/useRaiseProblem';

export default function ClientadminLayout() {
  const [toastNode, showToast] = useToast();
  const [raiseModal, openRaise] = useRaiseProblem(showToast);

  return (
    <AppShell onRaiseProblem={() => openRaise()} overlay={<>{raiseModal}{toastNode}</>}>
      <Outlet context={{ onOpenRequestModal: openRaise, showToast }} />
    </AppShell>
  );
}
