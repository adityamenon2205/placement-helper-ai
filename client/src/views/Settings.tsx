import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  Shield,
  Save,
  Trash2,
  ExternalLink,
  Volume2,
  Code
} from 'lucide-react';
import { fetchSettings, saveApiKey } from '../services/api';

interface SettingsProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onApiKeyUpdated: (configured: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onShowToast, onApiKeyUpdated }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [activeModel, setActiveModel] = useState('Built-in Placement Mentor Engine');
  const [savingKey, setSavingKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      const data = await fetchSettings();
      if (data.aiStatus) {
        setGeminiConfigured(data.aiStatus.geminiConfigured);
        setActiveModel(data.aiStatus.activeModel);
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setSavingKey(true);
    try {
      const res = await saveApiKey(apiKeyInput.trim());
      setGeminiConfigured(res.geminiConfigured);
      setActiveModel('gemini-2.5-flash');
      setApiKeyInput('');
      onApiKeyUpdated(true);
      onShowToast('Gemini API Key verified and active!', 'success');
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setSavingKey(false);
    }
  };

  const handleClearKey = async () => {
    setSavingKey(true);
    try {
      await saveApiKey('');
      setGeminiConfigured(false);
      setActiveModel('Built-in Placement Mentor Engine');
      onApiKeyUpdated(false);
      onShowToast('API Key cleared. Reverted to built-in mentor engine.', 'info');
    } catch (err: any) {
      onShowToast('Failed to clear key: ' + err.message, 'error');
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-indigo-900 flex items-center justify-center text-white shadow-lg">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Platform Settings & AI Engine</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure your AI intelligence provider, code execution sandboxing, and voice preferences.
            </p>
          </div>
        </div>
      </div>

      {/* AI Engine Status Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Dual-Engine AI Architecture</h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
            geminiConfigured
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              : 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${geminiConfigured ? 'bg-emerald-400' : 'bg-indigo-400'} animate-pulse`} />
            <span>Active: {activeModel}</span>
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Placement Helper AI</strong> uses a fault-tolerant Dual-Engine design. It runs out-of-the-box with our deterministic Built-in Placement Intelligence Engine, and elevates to live generative Google Gemini models (<code>gemini-2.5-flash</code>) when an API key is connected.
        </p>

        {/* Form to enter Gemini Key */}
        <form onSubmit={handleSaveKey} className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-300 block">
            Google Gemini API Key
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder={geminiConfigured ? '••••••••••••••••••••••••••••••••' : 'AIzaSy... (Paste Google AI Studio API Key)'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingKey || !apiKeyInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{savingKey ? 'Verifying...' : 'Verify & Save Key'}</span>
            </button>

            {geminiConfigured && (
              <button
                type="button"
                onClick={handleClearKey}
                disabled={savingKey}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 shrink-0"
                title="Remove Key"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Keys are stored in your local SQLite database and never sent to external servers.</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Get API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </div>

      {/* Sandboxed Code Execution Safeguards */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Execution Sandbox Security & Compilers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supported Compilers & Runtimes</span>
            </div>
            <p className="text-slate-400">
              Python 3.14, Node.js 24 (JavaScript), GCC 15.1 (C++), and Javac 21 (Java) are all recognized and active on the host system.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Process Isolation & Safeguards</span>
            </div>
            <p className="text-slate-400">
              6000ms strict timeout limit, temporary run directory per submission, disabled raw network sockets, and process-tree termination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
