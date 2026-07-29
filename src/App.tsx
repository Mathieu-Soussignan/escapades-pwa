import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { TimelineView } from './components/Timeline/TimelineView';
import { TripList } from './components/Trips/TripList';
import { AIPlannerWizard } from './components/LLMPlanner/AIPlannerWizard';
import { SettingsView } from './components/Settings/SettingsView';
import { initSeedData } from './db/database';
import { CheckCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  useEffect(() => {
    // Initialize seed data if empty
    initSeedData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <Header />

      <main className="max-w-md mx-auto px-4 pt-4">
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'trips' && <TripList />}
        {activeTab === 'ai_planner' && <AIPlannerWizard />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-2xl px-4 py-2.5 shadow-2xl border border-blue-500/40 text-xs font-semibold text-white flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <TabBar />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
