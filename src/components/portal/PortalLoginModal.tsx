import React, { useState } from 'react';
import {
  Lock,
  X,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../services/api';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, token: string) => void;
}

export const PortalLoginModal: React.FC<PortalLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email: email.trim(), password });
      if (res.success && res.user && res.csrf) {
        onLoginSuccess(res.user, 'secure-cookie-session');
      } else {
        setError('Invalid university credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A051C]/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border-2 border-[#4A1249] rounded-2xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative my-6 text-[#2E0F34] animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-[#4A1249] p-2 rounded bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Close portal sign-in"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header - HIAU Imperial Purple & Seal */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-purple-100">
          <img
            src="/assets/aistudio/image_bfcc4a11.png"
            alt="Harvest Intercontinental American University Seal"
            className="w-12 h-12 object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-collegiate font-bold text-[#4A1249] uppercase tracking-tight">
                HARVEST INTERCONTINENTAL AMERICAN UNIVERSITY ERP
              </h3>
              <span className="bg-[#4A1249]/10 text-[#4A1249] text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-[#4A1249]/30">
                Restricted Gateway
              </span>
            </div>
            {/* Multi-step navigation pathway breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-mono">
              <span>Public Website</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>University Services</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-[#4A1249] font-bold">Authentication Gateway</span>
            </div>
          </div>
        </div>

        {/* Security & Confidentiality Restricted Notice */}
        <div className="mt-4 p-3 bg-amber-50/80 border-l-4 border-[#C39A53] rounded-r-lg text-xs text-[#2A082C] flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-[#C39A53] shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-[#4A1249] uppercase tracking-wide block">
              RESTRICTED INSTITUTIONAL ACCESS — CREDENTIALS REQUIRED
            </span>
            <span className="text-slate-600 text-[11px] block mt-0.5">
              This system contains sensitive academic records, bursar ledgers, and Senate governance files. Access is restricted strictly to authorized university personnel, faculty, and enrolled students with official institutional credentials under Republic of Liberia higher education regulations.
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 max-w-lg mx-auto">
          {/* Institutional credentials only; demo access is disabled. */}
          <div className="bg-[#FAF4FB] border border-purple-100 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div className="text-xs font-bold text-[#4A1249] uppercase tracking-wider">
                Direct Account Sign-In
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Website Administrator Email
                </label>
                <input
                  type="text"
                  placeholder="admin@university.example"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#C39A53] hover:bg-[#D4B06F] text-[#2A082C] font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-[#2A082C]" />
                <span>Sign In to ERP Portal</span>
              </button>
            </form>

            <div className="pt-4 mt-4 border-t border-purple-100 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-[#4A1249]">Security Notice:</span> Access to this system is restricted to authorized university personnel. Only website media management is available during this phase. Other university ERP services are not yet enabled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
