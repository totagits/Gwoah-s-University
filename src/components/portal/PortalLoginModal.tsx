import React, { useState } from 'react';
import {
  Lock,
  UserCheck,
  Shield,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  AlertCircle,
  X,
  Sparkles,
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
      title: 'Dr. Gabriel M. Gwoah',
      badge: 'Super Admin',
      dept: 'University President',
      desc: 'Full executive oversight, Senate governance & system administration',
      avatar: '👨🏾‍🏫',
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
      title: 'Prof. Joseph Flomo',
      badge: 'Dean of Engineering',
      dept: 'College of Engineering',
      desc: 'Faculty workload, room allocations, syllabus & exam approval',
      avatar: '👨🏾‍🎓',
    },
    {
      role: 'lecturer' as UserRole,
      title: 'Dr. Moses S. Doe',
      badge: 'Senior Lecturer',
      dept: 'Computer Science',
      desc: 'Course roster, gradebook submission & exam moderation',
      avatar: '👨🏾‍💻',
    },
    {
      role: 'student' as UserRole,
      title: 'Sando Fahnbulleh',
      badge: 'Continuing Student',
      dept: 'B.Sc. CompSci (Year 3)',
      desc: 'Course registration, Add/Drop, fee statement, GPA & transcript',
      avatar: '🧑🏾‍🎓',
    },
    {
      role: 'bursar' as UserRole,
      title: 'Mr. Samuel Barclay',
      badge: 'Chief Bursar',
      dept: 'Finance & Accounts',
      desc: 'Tuition billing, EcoBank & Mobile Money reconciliations, holds',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative my-6 text-slate-100 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          aria-label="Close portal sign-in"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Gwoah's University ERP Subsystem
              </h3>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Restricted Area
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nested Path: Home → Academic Services → Student Services → University Portal
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left: 1-Click Role Switcher for instant evaluator access */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Select Demo Role to Evaluate Workflows:
              </span>
              <span className="text-[11px] text-slate-400">All 7 roles pre-configured</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {demoRoles.map((dr) => (
                <button
                  key={dr.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin(dr.role)}
                  className="text-left p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base">{dr.avatar}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 transition-colors">
                      {dr.badge}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {dr.title}
                    </div>
                    <div className="text-[11px] text-amber-400/80 font-medium">
                      {dr.dept}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {dr.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Manual Login Form */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Direct Account Sign-In
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institutional Email / Staff or Student ID
                </label>
                <input
                  type="text"
                  placeholder="name@gwoah.edu.lr or GU-..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In to ERP Portal</span>
              </button>
            </form>

            <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Security Notice:</span> Access to this system is restricted to authorized personnel. All transactions, grade modifications, and financial receipts are recorded in the immutable audit log.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
