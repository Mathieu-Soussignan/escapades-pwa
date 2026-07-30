import React, { useState } from 'react';
import { Key, ExternalLink, Check, X, ShieldCheck, Sparkles, Loader2, Copy } from 'lucide-react';
import { testMistralApiKey } from '../../services/llmService';
import { useApp } from '../../context/AppContext';

interface MistralTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  initialKey?: string;
}

export const MistralTutorialModal: React.FC<MistralTutorialModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  initialKey = ''
}) => {
  const { showToast } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState(initialKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

  if (!isOpen) return null;

  const handleVerifyKey = async () => {
    if (!apiKeyInput.trim()) {
      showToast('Veuillez d’abord coller votre clé API.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const isValid = await testMistralApiKey(apiKeyInput.trim());
    setIsTesting(false);

    if (isValid) {
      setTestResult('success');
      showToast('Clé Mistral AI validée et fonctionnelle ! 🎉');
      onSaveKey(apiKeyInput.trim());
    } else {
      setTestResult('failed');
      showToast('Clé invalide. Vérifiez qu’il n’y a pas de faute de frappe.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-purple-500/30 shadow-2xl space-y-4 text-left">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm font-display">
            <Key className="w-4 h-4 text-purple-400" />
            <span>Tutoriel : Obtenir sa Clé Mistral Gratuitement</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step by step visual instructions */}
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-mono">1</span>
              <span>Allez sur la console Mistral AI</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Mistral AI est un service français puissant et 100% gratuit.
            </p>
            <a
              href="https://console.mistral.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold text-[11px] hover:bg-purple-600/30 transition-all"
            >
              <span>Ouvrir console.mistral.ai</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-mono">2</span>
              <span>Connectez-vous en 1 clic</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Connectez-vous avec votre compte Google ou Email. Aucune carte bancaire n'est demandée !
            </p>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-mono">3</span>
              <span>Créez & collez votre clé ci-dessous</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Dans le menu de gauche, cliquez sur <strong>"API Keys"</strong> ➔ <strong>"Create new key"</strong>, copiez la clé et collez-la ici.
            </p>
          </div>
        </div>

        {/* Key Input & Live Verification */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-slate-200">
            Collez votre clé API Mistral AI :
          </label>
          <input
            type="password"
            placeholder="Ex: xxxxxxxxxxxxxxxxxxxxxxxxx"
            value={apiKeyInput}
            onChange={(e) => {
              setApiKeyInput(e.target.value);
              setTestResult(null);
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono focus:border-purple-500 focus:outline-none"
          />

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleVerifyKey}
              disabled={isTesting || !apiKeyInput.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Test en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🧪 Tester ma clé</span>
                </>
              )}
            </button>
          </div>

          {/* Test Status Feedback */}
          {testResult === 'success' && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Clé valide et enregistrée avec succès !</span>
            </div>
          )}

          {testResult === 'failed' && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <X className="w-4 h-4 text-rose-400" />
              <span>Clé invalide. Vérifiez votre copier-coller.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
