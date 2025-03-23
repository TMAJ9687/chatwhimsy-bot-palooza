
import React, { memo } from 'react';
import { useDialog } from '@/context/DialogContext';
import ReportDialog from './ReportDialog';
import BlockUserDialog from './BlockUserDialog';
import SiteRulesDialog from '../chat/SiteRulesDialog';

const DialogContainer = () => {
  const { state } = useDialog();
  
  // Only render the dialog that is currently open
  // This prevents unnecessary rendering of hidden dialogs
  if (!state.isOpen) return null;
  
  switch (state.type) {
    case 'report':
      return <ReportDialog />;
    case 'block':
      return <BlockUserDialog />;
    case 'siteRules':
      return <SiteRulesDialog />;
    default:
      return null;
  }
};

// Use memo to prevent unnecessary re-renders
export default memo(DialogContainer);
