import React, { useState } from 'react';
import {
  X,
  Sun,
  Moon,
  CheckCircle2,
  Eye,
  ShieldCheck,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A051C]/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-2 border-[#4A1249] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#2E0F34]">
        {/* Header - HIAU Imperial Purple with Gold Accent */}
        <div className="px-6 py-4 border-b border-[#C39A53]/30 flex items-center justify-between bg-[#4A1249] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#661B69] text-[#C39A53] border border-[#C39A53]/50 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-collegiate font-bold text-white uppercase tracking-tight">
                PORTAL ACCESSIBILITY & VISUAL SETTINGS
              </h2>
              <p className="text-xs text-purple-200">
                Institutional Display Preferences • {currentUser.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-white">
          {/* Notification banner if saved */}
          {saveSuccess && (
            <div className="bg-[#FAF4E8] border border-[#C39A53] rounded p-3 flex items-center gap-2.5 text-[#A17A32] text-xs font-bold uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4A1249]" />
              <span>
                Theme preference persisted to ERP user record for <strong>{currentUser.email}</strong>.
              </span>
            </div>
          )}

          {/* Theme Mode Selector Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Select Institutional Visual Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* HIAU Purple & Gold Ivory Standard (Recommended) */}
              <button
                type="button"
                onClick={() => handleSelect('light')}
                disabled={saving}
                className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedTheme === 'light'
                    ? 'border-[#4A1249] bg-[#FAF4FB] shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-[#4A1249] border border-[#C39A53] flex items-center justify-center text-[#C39A53]">
                    <Sun className="w-4 h-4" />
                  </div>
                  {selectedTheme === 'light' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#4A1249] bg-[#4A1249]/10 px-2 py-0.5 rounded uppercase tracking-wider border border-[#4A1249]/30">
                      <CheckCircle2 className="w-3 h-3 text-[#4A1249]" /> Standard
                    </span>
                  )}
                </div>
                <h4 className="text-base font-collegiate font-bold text-[#4A1249] mb-1 uppercase tracking-tight">
                  HIAU Purple & Gold
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Pristine White (#FFFFFF) canvas with Imperial Purple (#4A1249) and Heritage Gold (#C39A53).
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                    Contrast: 14.8:1
                  </span>
                  <span className="bg-[#4A1249]/10 text-[#4A1249] font-bold px-1.5 py-0.5 rounded border border-[#4A1249]/30">
                    WCAG AAA
                  </span>
                </div>
              </button>

              {/* HIAU Midnight Purple Mode */}
              <button
                type="button"
                onClick={() => handleSelect('dark')}
                disabled={saving}
                className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedTheme === 'dark'
                    ? 'border-[#C39A53] bg-[#2A082C] text-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-[#1A051C] border border-[#C39A53]/50 flex items-center justify-center text-[#C39A53]">
                    <Moon className="w-4 h-4" />
                  </div>
                  {selectedTheme === 'dark' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#C39A53] bg-[#1A051C] px-2 py-0.5 rounded uppercase tracking-wider border border-[#C39A53]/40">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <h4 className={`text-base font-collegiate font-bold mb-1 uppercase tracking-tight ${selectedTheme === 'dark' ? 'text-white' : 'text-[#4A1249]'}`}>
                  Midnight Purple Mode
                </h4>
                <p className={`text-xs leading-relaxed mb-3 ${selectedTheme === 'dark' ? 'text-purple-200' : 'text-slate-600'}`}>
                  Deep Midnight Purple (#1A051C) for low-glare evening study, registration, and grading.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className={`${selectedTheme === 'dark' ? 'bg-[#1A051C] text-purple-200' : 'bg-slate-200 text-slate-800'} px-1.5 py-0.5 rounded`}>
                    Contrast: 9.8:1
                  </span>
                  <span className="bg-[#C39A53]/20 text-[#C39A53] font-bold px-1.5 py-0.5 rounded border border-[#C39A53]/40">
                    WCAG AAA
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Active Accessibility Audit Card */}
          <div className="bg-[#FAF4FB] border border-purple-100 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A1249] flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#4A1249]" />
                Active Theme Accessibility Audit
              </span>
              <span className="text-[11px] font-mono text-[#4A1249] bg-[#4A1249]/10 border border-[#4A1249]/30 px-2 py-0.5 rounded font-extrabold uppercase">
                Grade: {currentDetails.wcagLevel} Pass
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentDetails.description}
            </p>
            <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Recommended For:</span>
              <span className="text-[#4A1249] font-bold">{currentDetails.idealFor}</span>
            </div>
          </div>

          {/* User ERP State Sync Metadata */}
          <div className="bg-[#FAF4FB] border border-purple-100 rounded p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>Bound User Account:</span>
              <span className="text-[#4A1249] font-bold">{currentUser.name} ({currentUser.email})</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Account Role:</span>
              <span className="text-[#4A1249] font-bold uppercase font-mono text-[11px]">{currentUser.role.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>ERP Persistence Backend:</span>
              <span className="text-[#4A1249] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A1249]" /> Synchronized (Local & Server)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-[#FAF4FB] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C39A53]" />
                <span>Saving to ERP database...</span>
              </>
            ) : (
              <span>Changes apply immediately across all portal tabs</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#C39A53] hover:bg-[#D4B06F] text-[#2A082C] font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
