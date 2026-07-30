import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TabBar } from './components/TabBar';
import { TimelineView } from './components/Timeline/TimelineView';
import { TripList } from './components/Trips/TripList';
import { AIPlannerWizard } from './components/LLMPlanner/AIPlannerWizard';
import { SettingsView } from './components/Settings/SettingsView';
import { WelcomeScreen } from './components/Landing/WelcomeScreen';
import { OnboardingTourModal } from './components/Onboarding/OnboardingTourModal';
import { SurprisePlannerModal } from './components/LLMPlanner/SurprisePlannerModal';
import { db, initSeedData } from './db/database';
import { requestNotificationPermission, checkAndScheduleTodayReminders } from './services/notificationService';
import { Sparkles, Bell, Download, Check, Compass, Home } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, activeTripId, setActiveTripId, showToast } = useApp();
  
  const [importedTripTitle, setImportedTripTitle] = useState<string | null>(null);
  const [importDataRaw, setImportDataRaw] = useState<any | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<boolean>(false);

  // Dedicated Landing Entrance Screen state
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);

  // Modals
  const [showOnboardingTour, setShowOnboardingTour] = useState<boolean>(false);
  const [showSurpriseModal, setShowSurpriseModal] = useState<boolean>(false);

  useEffect(() => {
    initSeedData();

    // Check if user is visiting for the very first time
    const hasSeenOnboarding = localStorage.getItem('escapades_has_seen_onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboardingTour(true);
      localStorage.setItem('escapades_has_seen_onboarding', 'true');
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationStatus(true);
    }
  }, []);

  // Check URL parameters for scanned QR Code trip import ?cloneTitle=... or ?qrd=... or ?importTrip=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cloneTitle = params.get('cloneTitle');
    const dest = params.get('dest');
    const vibe = params.get('vibe');
    const acts = params.get('acts');

    if (cloneTitle) {
      setShowWelcomeScreen(false); // Jump directly into app on QR scan
      setImportedTripTitle(cloneTitle);
      setImportDataRaw({
        title: cloneTitle,
        destination: dest || 'Destination',
        vibe: vibe || 'balanced',
        actsList: acts ? acts.split('|') : []
      });
    } else {
      const qrdParam = params.get('qrd');
      const importTripParam = params.get('importTrip');

      if (qrdParam) {
        setShowWelcomeScreen(false);
        try {
          const decoded = decodeURIComponent(qrdParam);
          const parsed = JSON.parse(decoded);
          if (parsed.t) {
            setImportedTripTitle(parsed.t || 'Nouvelle Escapade');
            setImportDataRaw(parsed);
          }
        } catch (err) {
          console.warn('Failed to parse qrd param:', err);
        }
      } else if (importTripParam) {
        setShowWelcomeScreen(false);
        try {
          const decoded = decodeURIComponent(escape(atob(importTripParam)));
          const parsed = JSON.parse(decoded);
          if (parsed.t) {
            setImportedTripTitle(parsed.t.title || parsed.t || 'Nouvelle Escapade');
            setImportDataRaw(parsed);
          }
        } catch (err) {
          console.warn('Failed to parse importTrip param:', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    const checkReminders = async () => {
      if (!activeTripId) return;
      const days = await db.days.where('tripId').equals(activeTripId).toArray();
      const dayIds = days.map(d => d.id!);
      const acts = await db.activities.where('dayId').anyOf(dayIds).toArray();
      checkAndScheduleTodayReminders(acts);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeTripId]);

  const handleConfirmImportFromQR = async () => {
    if (!importDataRaw) return;

    try {
      const title = importDataRaw.title || importDataRaw.t?.title || importDataRaw.t || 'Escapade Importée';
      const dest = importDataRaw.destination || importDataRaw.t?.destination || importDataRaw.d || 'Destination';

      const newTripId = await db.trips.add({
        title,
        destination: dest,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
        vibe: importDataRaw.vibe || importDataRaw.v || 'balanced',
        currency: 'EUR',
        status: 'active',
        createdAt: new Date().toISOString()
      });

      const dayId = await db.days.add({
        tripId: newTripId as number,
        dayNumber: 1,
        date: new Date().toISOString().split('T')[0],
        title: `Jour 1: Découverte de ${dest}`,
        summary: `Journée clonée par QR Code pour ${dest}.`
      });

      const actsList = importDataRaw.actsList || [];
      if (actsList.length > 0) {
        const actsToAdd = actsList.map((actName: string, idx: number) => ({
          dayId: dayId as number,
          time: `${9 + idx * 2}:00`,
          title: actName,
          description: `Étape du parcours à ${dest}`,
          category: idx === 1 ? 'restaurant' : 'monument',
          locationName: actName,
          durationMinutes: 60,
          priceEstimate: 'Gratuit',
          completed: false,
          order: idx + 1
        }));
        await db.activities.bulkAdd(actsToAdd);
      } else {
        await db.activities.add({
          dayId: dayId as number,
          time: '10:00',
          title: `Arrivée à ${dest}`,
          description: 'Première étape du séjour.',
          category: 'monument',
          locationName: dest,
          durationMinutes: 60,
          priceEstimate: 'Gratuit',
          completed: false,
          order: 1
        });
      }

      setActiveTripId(newTripId as number);
      setImportedTripTitle(null);
      setImportDataRaw(null);
      
      window.history.replaceState({}, document.title, window.location.pathname);

      showToast('Escapade clonée et importée avec succès ! 🎉');
      setActiveTab('timeline');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l’importation de l’escapade.');
    }
  };

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted);
    if (granted) {
      showToast('Notifications de rappels d’étapes activées ! 🔔');
    } else {
      showToast('Notifications refusées ou non supportées.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-20">
      
      {/* FULLSCREEN WELCOME ENTRANCE SCREEN */}
      {showWelcomeScreen && (
        <WelcomeScreen
          onEnterApp={() => {
            setShowWelcomeScreen(false);
            setActiveTab('timeline');
          }}
          onOpenSurprise={() => {
            setShowWelcomeScreen(false);
            setShowSurpriseModal(true);
          }}
        />
      )}

      {/* Top Mobile Bar Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 pb-3 pt-safe-header">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowWelcomeScreen(true)}>
            <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-xl shadow-blue-500/30 border-2 border-white/80 ring-2 ring-blue-500/30 flex items-center justify-center overflow-hidden shrink-0 hover:scale-105 transition-all">
              <img src="/escapade_logo.png" alt="Escapades Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-xl tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Escapades
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Return to Home Screen Button */}
            <button
              onClick={() => setShowWelcomeScreen(true)}
              className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title="Retour à l'accueil"
            >
              <Home className="w-4 h-4" />
            </button>

            {/* Surprise Inspire-Moi Quick Button */}
            <button
              onClick={() => setShowSurpriseModal(true)}
              className="p-2 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
              title="✨ Inspire-moi !"
            >
              <Compass className="w-4 h-4 text-purple-400" />
            </button>

            {/* Notification Bell Button */}
            <button
              onClick={handleToggleNotifications}
              className={`p-2 rounded-2xl border transition-all text-xs font-semibold flex items-center gap-1 ${
                notificationStatus
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={notificationStatus ? "Rappels activés" : "Activer les rappels d'étapes"}
            >
              <Bell className={`w-4 h-4 ${notificationStatus ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Instant QR Code Import Prompt Banner */}
      {importedTripTitle && (
        <div className="max-w-md mx-auto px-4 pt-3">
          <div className="glass-panel rounded-3xl p-4 border border-purple-500/40 bg-gradient-to-r from-purple-950/40 to-slate-950 shadow-2xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
              <Download className="w-4 h-4 text-purple-400" />
              <span>Importation d'Escapade Scannée par QR Code</span>
            </div>
            <p className="text-xs text-slate-200">
              Voulez-vous importer <strong className="text-white">"{importedTripTitle}"</strong> sur votre téléphone ?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirmImportFromQR}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Importer l'escapade
              </button>
              <button
                onClick={() => {
                  setImportedTripTitle(null);
                  setImportDataRaw(null);
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs"
              >
                Ignorer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="max-w-md mx-auto px-4 pt-4">
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'trips' && <TripList />}
        {activeTab === 'ai_planner' && <AIPlannerWizard />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={showOnboardingTour}
        onClose={() => setShowOnboardingTour(false)}
        onStartPlanning={() => {
          setShowWelcomeScreen(false);
          setActiveTab('ai_planner');
        }}
      />

      {/* Surprise Inspire-Moi Modal */}
      <SurprisePlannerModal
        isOpen={showSurpriseModal}
        onClose={() => setShowSurpriseModal(false)}
      />

      {/* Fixed Bottom Glass TabBar (ONLY VISIBLE ONCE INSIDE APP) */}
      {!showWelcomeScreen && <TabBar />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
