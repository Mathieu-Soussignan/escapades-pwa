import React from 'react';
import { useApp, TabType } from '../context/AppContext';
import { Map, Calendar, Sparkles, Settings } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'trips', label: 'Escapades', icon: Map },
    { id: 'ai_planner', label: 'Assistant AI', icon: Sparkles },
    { id: 'settings', label: 'Réglages', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe-nav pt-2 pointer-events-none">
      <nav className="max-w-md mx-auto pointer-events-auto bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-1.5 shadow-2xl border border-slate-700/60 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 -z-10 animate-pulse-subtle" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-semibold mt-1 tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
