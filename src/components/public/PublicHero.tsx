import React from 'react';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  Layers,
  BarChart3,
  ListTodo,
} from 'lucide-react';

interface PublicHeroProps {
  onOpenPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenApplicationModal: () => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({
  onOpenPortal,
  onNavigateSection,
  onOpenApplicationModal,
}) => {
  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
      {/* Decorative backdrop elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Full NCHE Institutional Accreditation & Recognition • Republic of Liberia</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Shaping Tomorrow's Leaders for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Liberia and the World</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              Gwoah's University is a premier 21st-century institution delivering rigorous degree programs in Health Sciences, Engineering, Computing, Agriculture, and Public Administration across our Monrovia and Fendall campuses.
            </p>

            {/* Public Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenApplicationModal}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Apply for 2026/2027 Admissions</span>
              </button>

              <button
                onClick={() => onNavigateSection('colleges')}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Explore Colleges & Curricula</span>
              </button>

              <button
                onClick={onOpenPortal}
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold rounded-xl border border-amber-500/40 hover:border-amber-400 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>University ERP Portal</span>
              </button>
            </div>

            {/* Quick institutional badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-400">1,850+</div>
                <div className="text-xs text-slate-400">Enrolled Scholars</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-400">5</div>
                <div className="text-xs text-slate-400">Academic Colleges</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-400">120-132</div>
                <div className="text-xs text-slate-400">B.Sc. Credit Standard</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-400">100%</div>
                <div className="text-xs text-slate-400">NCHE Aligned</div>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Preview & Nested Architecture Callout */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-mono text-slate-400">erp.gwoah.edu.lr</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Integrated ERP Subsystem
                </span>
              </div>

              {/* ERP Feature Highlights inside Hero Card */}
              <div className="mt-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <ListTodo className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Institutional Task Management</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Interactive Kanban and priority workflows for accreditation review, exam moderation, admissions verification, and SLA tracking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Integrated Analytics Engine</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Live institutional dashboards monitoring admissions conversion, tuition revenue, faculty workload, and MoE EMIS datasets.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Academic Planning & Add/Drop</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Course prerequisites enforcement, capacity management, official printable semester registration plans, and Bursar audit controls.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nested Portal Entry Callout */}
              <div className="mt-5 pt-4 border-t border-slate-700/80">
                <div className="text-[11px] text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">Nested Navigation Entry:</span> Home → Academic Services → Student Services → University Portal
                </div>
                <button
                  onClick={onOpenPortal}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Launch ERP System & Task Board</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
