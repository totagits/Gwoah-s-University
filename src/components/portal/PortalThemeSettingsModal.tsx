import React, { useState } from 'react';
import {
  X,
  Sun,
  Moon,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { ThemeMode, getThemeAccessibilityDetails } from '../../utils/themeManager';

interface PortalThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => Promise<void>;
}

export const PortalThemeSettingsModal: React.FC<PortalThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentTheme,
  onThemeChange,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(currentTheme);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentDetails = getThemeAccessibilityDetails(selectedTheme);

  const handleSelect = async (mode: ThemeMode) => {
    setSelectedTheme(mode);
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onThemeChange(mode);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update theme:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Portal Accessibility & Theme Settings
              </h2>
              <p className="text-xs text-slate-400">
                User-Specific ERP Display Preferences • {currentUser.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Notification banner if saved */}
          {saveSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-700/80 rounded-xl p-3 flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Theme preference persisted to ERP user record for <strong>{currentUser.email}</strong>.
              </span>
            </div>
          )}

          {/* Theme Mode Selector Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Select Display Contrast Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Slate Dark Mode Option */}
              <button
                type="button"
                onClick={() => handleSelect('dark')}
                disabled={saving}
                className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedTheme === 'dark'
                    ? 'border-amber-500 bg-slate-950 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  {selectedTheme === 'dark' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Gwoah Slate Dark
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Default deep navy-slate interface for reduced eye fatigue during extended evening studying.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded">Contrast: 9.2:1</span>
                  <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">WCAG AAA</span>
                </div>
              </button>

              {/* High-Contrast Light Mode Option */}
              <button
                type="button"
                onClick={() => handleSelect('light')}
                disabled={saving}
                className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedTheme === 'light'
                    ? 'border-amber-500 bg-slate-100 text-slate-900 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-600">
                    <Sun className="w-4 h-4" />
                  </div>
                  {selectedTheme === 'light' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-400 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <h4 className={`text-sm font-bold mb-1 ${selectedTheme === 'light' ? 'text-slate-950' : 'text-white'}`}>
                  High-Contrast Light
                </h4>
                <p className={`text-xs leading-relaxed mb-3 ${selectedTheme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                  Ultra-clear daylight contrast with deep slate text on clean white surfaces for maximum accessibility.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className={`${selectedTheme === 'light' ? 'bg-slate-200 text-slate-900' : 'bg-slate-800 text-slate-400'} px-1.5 py-0.5 rounded`}>
                    Contrast: 14.8:1
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-500">
                    WCAG AAA
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Active Accessibility Audit Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Active Theme Accessibility Audit
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                Grade: {currentDetails.wcagLevel} Pass
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentDetails.description}
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Recommended For:</span>
              <span className="text-slate-200 font-medium">{currentDetails.idealFor}</span>
            </div>
          </div>

          {/* User ERP State Sync Metadata */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Bound User Account:</span>
              <span className="text-slate-200 font-semibold">{currentUser.name} ({currentUser.email})</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Role:</span>
              <span className="text-amber-400 uppercase font-mono text-[11px]">{currentUser.role.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>ERP Persistence Backend:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized (Local & Server)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Saving to ERP database...</span>
              </>
            ) : (
              <span>Changes apply immediately across all portal tabs</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
