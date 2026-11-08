import React, { useState } from 'react';
import {
  Lock,
  X,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
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

  const demoRoles = [
    {
      role: 'super_admin' as UserRole,
      title: 'Dr. Kona-Facia Freeman-Nepay',
      badge: 'President',
      dept: 'Office of the President',
      desc: 'Executive university governance, Senate oversight, accreditation & institutional management',
      avatar: '👩🏾‍🏫',
      avatarImg: '/assets/hiau/president_kona_facia_nepay.jpg',
    },
    {
      role: 'registrar' as UserRole,
      title: 'Mrs. Patricia Tweh',
      badge: 'Registrar',
      dept: 'Office of the Registrar',
      desc: 'Academic records, course catalog, graduation & NCHE self-study',
      avatar: '👩🏾‍💼',
    },
    {
      role: 'dean' as UserRole,
      title: 'Prof. Mamawa M. Freeman-Moore',
      badge: 'Dean of Education',
      dept: 'College of Education',
      desc: 'Faculty workload, room allocations, syllabus & exam moderation',
      avatar: '👩🏾‍🎓',
      avatarImg: '/assets/hiau/prof_mamawa_freeman_moore.png',
    },
    {
      role: 'lecturer' as UserRole,
      title: 'Dr. Jacob Meiporkoyah',
      badge: 'Professor of Theology',
      dept: 'College of Theology',
      desc: 'Course roster, gradebook submission, continuous assessments & attendance',
      avatar: '👨🏾‍💻',
      avatarImg: '/assets/hiau/dr_jacob_meiporkoyah.png',
    },
    {
      role: 'student' as UserRole,
      title: 'Sando Fahnbulleh',
      badge: 'Continuing Student',
      dept: 'B.Sc. CompSci (Year 3)',
      desc: 'Course registration, Add/Drop, fee statement, GPA audit & transcript',
      avatar: '🧑🏾‍🎓',
    },
    {
      role: 'bursar' as UserRole,
      title: 'Mr. Samuel Barclay',
      badge: 'Chief Bursar',
      dept: 'Finance & Accounts',
      desc: 'Tuition billing, EcoBank & Mobile Money reconciliations, fee holds',
      avatar: '👨🏾‍💼',
    },
    {
      role: 'admissions_officer' as UserRole,
      title: 'Ms. Helena Kollie',
      badge: 'Admissions Officer',
      dept: 'Admissions & Outreach',
      desc: 'WASSCE credential verification, scoring rubrics & admit decisions',
      avatar: '👩🏾‍🏫',
    },
  ];

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ role });
      if (res.success && res.user) {
        onLoginSuccess(res.user, res.token);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.user) {
        onLoginSuccess(res.user, res.token);
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left: 1-Click Role Switcher for instant evaluator access */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A1249] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C39A53]" />
                Select Demo Role to Evaluate Workflows:
              </span>
              <span className="text-[11px] text-slate-500 font-medium">All 7 roles pre-configured</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {demoRoles.map((dr) => (
                <button
                  key={dr.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin(dr.role)}
                  className="text-left p-3.5 rounded-lg bg-[#FAF4FB] hover:bg-purple-50/60 border border-purple-100 hover:border-[#4A1249] transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      {dr.avatarImg ? (
                        <img
                          src={dr.avatarImg}
                          alt={dr.title}
                          className="w-7 h-7 rounded-full object-cover border border-[#C39A53]/60 shadow-xs"
                        />
                      ) : (
                        <span className="text-base">{dr.avatar}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white group-hover:bg-[#4A1249] group-hover:text-[#C39A53] text-slate-700 border border-slate-200 transition-colors uppercase">
                      {dr.badge}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#4A1249] group-hover:text-[#661B69] transition-colors">
                      {dr.title}
                    </div>
                    <div className="text-[11px] text-[#C39A53] font-bold">
                      {dr.dept}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {dr.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Manual Login Form */}
          <div className="lg:col-span-5 bg-[#FAF4FB] border border-purple-100 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div className="text-xs font-bold text-[#4A1249] uppercase tracking-wider">
                Direct Account Sign-In
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Institutional Email / Staff or Student ID
                </label>
                <input
                  type="text"
                  placeholder="name@hiau.edu.lr or HIAU-..."
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
              <span className="font-bold text-[#4A1249]">Security Notice:</span> Access to this system is restricted to authorized university personnel. All transactions, grade modifications, and financial receipts are recorded in the immutable audit log.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
