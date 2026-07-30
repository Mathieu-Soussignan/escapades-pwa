import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initSeedData } from '../../db/database';
import { useApp } from '../../context/AppContext';
import type { GPSApp } from '../../types';
import { MistralTutorialModal } from './MistralTutorialModal';
import { 
  Navigation, 
  Download, 
  Upload, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  HelpCircle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { showToast } = useApp();
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  const [defaultGPS, setDefaultGPS] = useState<GPSApp>('google_maps');
  const [activeOsGuide, setActiveOsGuide] = useState<'ios' | 'android'>('ios');
  
  const [showAdvancedAI, setShowAdvancedAI] = useState(false);
  const [showMistralTutorial, setShowMistralTutorial] = useState(false);
  const [llmProvider, setLlmProvider] = useState<'mistral' | 'gemini' | 'openai' | 'anthropic' | 'custom'>('mistral');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('mistral-small-latest');

  useEffect(() => {
    if (settings) {
      setDefaultGPS(settings.defaultGPS || 'google_maps');
      setLlmProvider(settings.llmProvider || 'mistral');
      setApiKey(settings.apiKey || '');
      setModelName(settings.modelName || 'mistral-small-latest');
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings && settings.id) {
      await db.settings.update(settings.id, {
        defaultGPS,
        llmProvider,
        apiKey,
        modelName
      });
    } else {
      await db.settings.add({
        defaultGPS,
        llmProvider,
        apiKey,
        modelName,
        theme: 'dark'
      });
    }
    showToast('Réglages enregistrés avec succès ! ✨');
  };

  const handleSaveKeyFromTutorial = async (key: string) => {
    setApiKey(key);
    setLlmProvider('mistral');
    if (settings && settings.id) {
      await db.settings.update(settings.id, { apiKey: key, llmProvider: 'mistral' });
    }
    setShowMistralTutorial(false);
  };

  const handleExportData = async () => {
    const trips = await db.trips.toArray();
    const days = await db.days.toArray();
    const activities = await db.activities.toArray();

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ trips, days, activities }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `escapades_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Sauvegarde exportée !');
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.trips && json.days && json.activities) {
          await db.trips.clear();
          await db.days.clear();
          await db.activities.clear();

          await db.trips.bulkAdd(json.trips);
          await db.days.bulkAdd(json.days);
          await db.activities.bulkAdd(json.activities);

          showToast('Données restaurées !');
        }
      } catch (err) {
        alert('Fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = async () => {
    if (confirm('Réinitialiser l\'application avec les escapades de démonstration ?')) {
      await db.trips.clear();
      await db.days.clear();
      await db.activities.clear();
      await initSeedData();
      showToast('Exemples de démonstration rechargés !');
    }
  };

  return (
    <div className="space-y-4 pb-24 text-xs">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">Préférences</h2>
          <p className="text-xs text-slate-400">Personnalisez votre expérience de voyage</p>
        </div>
      </div>

      {/* PWA Mobile Installation Guide */}
      <div className="glass-panel rounded-3xl p-4 border border-blue-500/30 bg-gradient-to-r from-blue-950/30 to-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-100 text-xs font-display">Installer l'application sur son téléphone</h3>
          </div>

          <div className="flex bg-slate-900 border border-slate-700/80 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveOsGuide('ios')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                activeOsGuide === 'ios' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              🍏 iPhone
            </button>
            <button
              type="button"
              onClick={() => setActiveOsGuide('android')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                activeOsGuide === 'android' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              🤖 Android
            </button>
          </div>
        </div>

        {activeOsGuide === 'ios' ? (
          <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-1">
            <p>1. Ouvrez ce site dans <strong className="text-blue-400">Safari</strong> sur votre iPhone.</p>
            <p>2. Appuyez sur le bouton <strong className="text-blue-400">Partager ⎋</strong> en bas de l'écran.</p>
            <p>3. Sélectionnez <strong className="text-white">« Sur l'écran d'accueil »</strong> puis cliquez sur <strong className="text-blue-400">Ajouter</strong>.</p>
          </div>
        ) : (
          <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-1">
            <p>1. Ouvrez ce site dans <strong className="text-emerald-400">Google Chrome</strong> sur Android.</p>
            <p>2. Appuyez sur le menu <strong className="text-emerald-400">Menu (3 petits points ⋮)</strong> en haut à droite.</p>
            <p>3. Appuyez sur <strong className="text-white">« Installer l'application »</strong>.</p>
          </div>
        )}
      </div>

      {/* Main Simple Form */}
      <form onSubmit={handleSaveSettings} className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        
        {/* Preferred GPS Selection */}
        <div>
          <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5 text-xs">
            <Navigation className="w-4 h-4 text-blue-400" />
            Votre application GPS préférée
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'google_maps', label: 'Google Maps', icon: '🗺️' },
              { id: 'waze', label: 'Waze', icon: '🏎️' },
              { id: 'apple_maps', label: 'Apple Maps', icon: '🍏' }
            ].map((gps) => (
              <button
                key={gps.id}
                type="button"
                onClick={() => setDefaultGPS(gps.id as GPSApp)}
                className={`p-3 rounded-2xl border text-center font-semibold transition-all ${
                  defaultGPS === gps.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold ring-1 ring-blue-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-base">{gps.icon}</div>
                <div className="text-[11px] mt-0.5">{gps.label}</div>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-800" />

        {/* User-Friendly AI Status & Optional Key Accordion */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Génération IA d'itinéraires</span>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedAI(!showAdvancedAI)}
              className="text-purple-400 hover:text-purple-300 text-[11px] font-semibold flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded-xl"
            >
              <Sliders className="w-3 h-3" />
              <span>{showAdvancedAI ? 'Masquer' : 'Clef API perso'}</span>
              {showAdvancedAI ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-[11px] text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                L'assistant démo gratuit est actif par défaut !
              </p>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Vous n'avez rien à configurer. L'application génère automatiquement des séjours complets gratuitement.
            </p>

            {/* Easy Tutorial Link Button for End-Users */}
            <button
              type="button"
              onClick={() => setShowMistralTutorial(true)}
              className="w-full mt-1 py-2 px-3 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-purple-800/40 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-purple-300" />
              <span>💡 Comment avoir ma propre clé Mistral IA gratuite ?</span>
            </button>
          </div>

          {/* Optional Advanced AI Key Entry for Power Users */}
          {showAdvancedAI && (
            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-3 animate-fadeIn">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service AI</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLlmProvider('mistral')}
                    className={`p-2.5 rounded-xl border text-left text-[11px] font-bold ${
                      llmProvider === 'mistral' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    🇫🇷 Mistral AI (Gratuit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLlmProvider('gemini')}
                    className={`p-2.5 rounded-xl border text-left text-[11px] font-bold ${
                      llmProvider === 'gemini' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✨ Google Gemini
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                  Votre clef API personnelle {llmProvider.toUpperCase()}
                </label>
                <input
                  type="password"
                  placeholder="Collez votre clef API ici..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 active:scale-[0.99]"
        >
          Enregistrer mes préférences
        </button>

      </form>

      {/* Data Backup & Restore */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-3">
        <h3 className="font-bold text-slate-200 text-xs">Sauvegarde de mes voyages</h3>
        <p className="text-slate-400 text-[11px]">
          Vos escapades sont conservées uniquement sur cet appareil.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Sauvegarder
          </button>

          <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-semibold cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            Restaurer
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleResetSeed}
          className="w-full mt-2 py-2 rounded-xl text-slate-400 hover:text-rose-400 text-[11px] flex items-center justify-center gap-1 hover:bg-rose-500/10 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Recharger les exemples de démonstration
        </button>
      </div>

      {/* Mistral Tutorial Modal */}
      <MistralTutorialModal
        isOpen={showMistralTutorial}
        onClose={() => setShowMistralTutorial(false)}
        onSaveKey={handleSaveKeyFromTutorial}
        initialKey={apiKey}
      />

    </div>
  );
};
