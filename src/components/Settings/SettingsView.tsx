import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initSeedData } from '../../db/database';
import { useApp } from '../../context/AppContext';
import type { GPSApp } from '../../types';
import { Key, Navigation, Download, Upload, RefreshCw, Smartphone, ShieldCheck, ExternalLink } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { showToast } = useApp();
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  const [llmProvider, setLlmProvider] = useState<'mistral' | 'gemini' | 'openai' | 'anthropic' | 'custom'>('mistral');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('mistral-small-latest');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [defaultGPS, setDefaultGPS] = useState<GPSApp>('google_maps');

  useEffect(() => {
    if (settings) {
      setLlmProvider(settings.llmProvider || 'mistral');
      setApiKey(settings.apiKey || '');
      setModelName(settings.modelName || 'mistral-small-latest');
      setCustomEndpoint(settings.customEndpoint || '');
      setDefaultGPS(settings.defaultGPS || 'google_maps');
    }
  }, [settings]);

  const handleProviderChange = (provider: 'mistral' | 'gemini' | 'openai' | 'anthropic' | 'custom') => {
    setLlmProvider(provider);
    if (provider === 'mistral') {
      setModelName('mistral-small-latest');
    } else if (provider === 'gemini') {
      setModelName('gemini-1.5-flash');
    } else if (provider === 'openai') {
      setModelName('gpt-4o');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings && settings.id) {
      await db.settings.update(settings.id, {
        llmProvider,
        apiKey,
        modelName,
        customEndpoint,
        defaultGPS
      });
    } else {
      await db.settings.add({
        llmProvider,
        apiKey,
        modelName,
        customEndpoint,
        defaultGPS,
        theme: 'dark'
      });
    }
    showToast('Réglages enregistrés !');
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
    showToast('Sauvegarde exportée avec succès !');
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

          showToast('Données restaurées avec succès !');
        }
      } catch (err) {
        alert('Fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = async () => {
    if (confirm('Réinitialiser la base de données avec les escapades de démonstration ?')) {
      await db.trips.clear();
      await db.days.clear();
      await db.activities.clear();
      await initSeedData();
      showToast('Exemples de démonstration rechargés !');
    }
  };

  return (
    <div className="space-y-4 pb-16 text-xs">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">Réglages</h2>
          <p className="text-xs text-slate-400">Configuration API, AI & GPS</p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        
        {/* GPS Application Preference */}
        <div>
          <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5 text-xs">
            <Navigation className="w-4 h-4 text-blue-400" />
            Application GPS par défaut
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
                className={`p-2.5 rounded-2xl border text-center font-semibold transition-all ${
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

        {/* API LLM Configuration */}
        <div>
          <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5 text-xs">
            <Key className="w-4 h-4 text-purple-400" />
            Fournisseur AI & Clé API (Mistral & Gemini)
          </label>
          
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-medium">Modèle AI / Service</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'mistral', label: 'Mistral AI', badge: 'Gratuit / Free Tier', icon: '🇫🇷' },
                  { id: 'gemini', label: 'Google Gemini', badge: 'Google AI Studio', icon: '✨' },
                  { id: 'openai', label: 'OpenAI', badge: 'GPT-4o', icon: '🤖' },
                  { id: 'custom', label: 'Custom / Local', badge: 'Ollama', icon: '💻' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      llmProvider === p.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-bold ring-1 ring-purple-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-white">
                      <span>{p.icon}</span> {p.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Name Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-medium">Modèle spécifique</label>
              {llmProvider === 'mistral' ? (
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 font-medium focus:outline-none"
                >
                  <option value="mistral-small-latest">mistral-small-latest (Rapide & Gratuit)</option>
                  <option value="mistral-large-latest">mistral-large-latest (Raisonnement avancé)</option>
                  <option value="open-mixtral-8x7b">open-mixtral-8x7b</option>
                </select>
              ) : llmProvider === 'gemini' ? (
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 font-medium focus:outline-none"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Ultra rapide - Free Tier)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Nouvelle génération)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Raisonnement haute précision)</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="gpt-4o / mistral-small-latest"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none"
                />
              )}
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-medium">
                Clé API {llmProvider.toUpperCase()}
              </label>
              <input
                type="password"
                placeholder={
                  llmProvider === 'mistral' ? 'Clé API console.mistral.ai...' :
                  llmProvider === 'gemini' ? 'Clé API Google AI Studio...' : 'Clé API secret...'
                }
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-purple-500 focus:outline-none text-xs"
              />

              {/* Helpful Tips per Provider */}
              <div className="mt-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                {llmProvider === 'mistral' && (
                  <p className="flex items-center gap-1 text-slate-300">
                    💡 Obtenez une clé 100% gratuite sur <a href="https://console.mistral.ai/" target="_blank" rel="noreferrer" className="text-blue-400 underline font-semibold flex items-center gap-0.5">console.mistral.ai <ExternalLink className="w-3 h-3" /></a>
                  </p>
                )}
                {llmProvider === 'gemini' && (
                  <p className="flex items-center gap-1 text-slate-300">
                    ✨ Obtenez une clé gratuite avec des quotas très élevés sur <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline font-semibold flex items-center gap-0.5">Google AI Studio <ExternalLink className="w-3 h-3" /></a>
                  </p>
                )}
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  La clé reste stockée localement dans IndexedDB sur votre iPhone.
                </p>
              </div>
            </div>

            {llmProvider === 'custom' && (
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Endpoint personnalisé (Ollama / Local)</label>
                <input
                  type="text"
                  placeholder="http://localhost:11434/v1/chat/completions"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 active:scale-[0.99]"
        >
          Enregistrer les réglages
        </button>

      </form>

      {/* PWA iOS Banner */}
      <div className="glass-panel rounded-3xl p-4 border border-blue-500/30 bg-gradient-to-r from-blue-950/40 to-slate-900 flex items-start gap-3">
        <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl shrink-0">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-100 text-xs">Installer l'application sur votre iPhone</h3>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Dans Safari, appuyez sur le bouton <span className="font-semibold text-blue-400">Partager</span> (icône carré avec flèche vers le haut), puis sélectionnez <span className="font-semibold text-blue-400 font-bold">Sur l'écran d'accueil</span>.
          </p>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-3">
        <h3 className="font-bold text-slate-200 text-xs">Sauvegarde & Restauration des Données</h3>
        <p className="text-slate-400 text-[11px]">
          Toutes vos escapades sont conservées hors-ligne sur cet appareil.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Exporter JSON
          </button>

          <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-semibold cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            Importer JSON
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
          Recharger les données de démonstration
        </button>
      </div>

    </div>
  );
};
