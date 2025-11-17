import React from 'react';
import { AlertsPanel, StatsPanel, ExportsPanel, QuestionsPanel } from './Sidebar';
import DebugURLPanel from './DebugURLPanel';

const SidebarMain = () => {
  return (
    <div className="sidebar space-y-4 p-4 bg-slate-900 text-white">
      <AlertsPanel />
      <StatsPanel />
      <QuestionsPanel />
      <ExportsPanel />
      
      {/* 🐛 Panneau de débogage URLs */}
      <DebugURLPanel />
    </div>
  );
};

export default SidebarMain;