import React from 'react';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin, Globe, Lock } from 'lucide-react';

interface PublicFooterProps {
  onOpenPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onOpenPortal,
  onNavigateSection,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Charter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">Gwoah's University</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Chartered higher-education institution in the Republic of Liberia. Dedicated to academic excellence, ethical leadership, and transformative research.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>National Commission on Higher Education (NCHE) Accredited</span>
            </div>
          </div>

          {/* Col 2: Campuses */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Campus Locations</h4>
            <div className="space-y-3 pt-1">
              <div>
                <div className="font-semibold text-slate-200">Capital Campus — Monrovia</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Capitol Hill / Tubman Blvd, Montserrado County</span>
                </div>
              </div>
              <div>
                <div className="font-semibold text-slate-200">Agro-Technology Campus — Fendall</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Careysburg District, Montserrado County</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Academic & Portal Links */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 pt-1">
              <li>
                <button onClick={() => onNavigateSection('colleges')} className="hover:text-amber-400 transition-colors">
                  Faculties & Degree Programs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('admissions')} className="hover:text-amber-400 transition-colors">
                  Undergraduate Admissions (WASSCE)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('calendar')} className="hover:text-amber-400 transition-colors">
                  Senate Academic Calendar 2026/2027
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('dei')} className="hover:text-amber-400 transition-colors">
                  Liberia DEI Higher Ed Policy
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenPortal}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>University ERP & Task Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Statutory Disclaimers & Official References */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Regulatory Compliance</h4>
            <div className="text-[11px] space-y-1.5 text-slate-400 leading-normal">
              <p>• NCHE Act of Liberia & 120-132 Credit Baccalaureate Standard</p>
              <p>• MoE DEI Policy in Higher Education (31 October 2024)</p>
              <p>• Liberia Education Sector Plan (ESP 2022/23–2026/27)</p>
              <p>• MoE Tertiary EMIS Reporting Data Guidelines</p>
              <p>• Telecommunications & Data Protection Directives</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Gwoah's University, Republic of Liberia. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Demonstration Environment for Evaluation</span>
            <span>•</span>
            <span>Version 2.4.0 (Full-Stack ERP Active)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
