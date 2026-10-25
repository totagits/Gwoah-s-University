import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  ShieldCheck,
  ChevronDown,
  Lock,
  Layers,
  ArrowRight,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface PublicNavbarProps {
  onOpenPortal: () => void;
  currentUser: UserProfile | null;
  onNavigateSection: (sectionId: string) => void;
  activeSection: string;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onOpenPortal,
  currentUser,
  onNavigateSection,
  activeSection,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [nestedHopOpen, setNestedHopOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'about', label: 'About & Campuses' },
    { id: 'colleges', label: 'Colleges & Programs' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'calendar', label: 'Academic Calendar' },
    { id: 'dei', label: 'DEI & Accessibility' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top institutional strip */}
      <div className="bg-amber-600 text-slate-950 text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-slate-950 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
              Republic of Liberia
            </span>
            <span className="hidden sm:inline text-slate-950 font-semibold">
              Chartered by the National Commission on Higher Education (NCHE) • Accreditation Ref: NCHE/ACCR/2026-GU
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-emerald-950" />
              <span>Campus Starlink & Low-Bandwidth Mode Active</span>
            </span>
            <span className="hidden md:inline">Monrovia & Fendall Campuses</span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Motto */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigateSection('hero')}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Gwoah's University
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Liberia
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Knowledge • Integrity • National Service
              </p>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigateSection(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === link.id
                    ? 'text-amber-400 bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* NESTED NAVIGATION FOR PORTAL ACCESS (Prompt Section 0 Requirement) */}
            <div className="relative ml-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 250)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>University Services</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Institutional Services Directory
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => onNavigateSection('about')}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        Academic Affairs
                      </span>
                    </button>
                    <button
                      onClick={() => onNavigateSection('dei')}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        Student Affairs & DEI
                      </span>
                    </button>

                    {/* Multi-Hop Navigation: Academic Services -> Student Services -> University Portal */}
                    <div className="mt-1 pt-1 border-t border-slate-800">
                      <div className="px-3 py-1 text-[11px] text-amber-400 font-medium">
                        Nested Portal Access:
                      </div>
                      <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800/80 mt-1">
                        <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                          <span>Home</span>
                          <span>→</span>
                          <span>Services</span>
                          <span>→</span>
                          <span className="text-amber-400 font-semibold">ERP Portal</span>
                        </div>
                        <button
                          onClick={onOpenPortal}
                          className="w-full mt-1.5 flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-md shadow transition-all"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Enter University ERP Portal</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action: Direct ERP Entry or Active Session Indicator */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-semibold shadow transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ERP Portal ({currentUser.role.replace('_', ' ')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>University ERP Portal</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenPortal}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-md"
            >
              ERP Portal
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigateSection(link.id);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-md font-medium"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onOpenPortal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 text-slate-950 font-bold text-sm rounded-lg"
              >
                <Lock className="w-4 h-4" />
                <span>Access University ERP & Tasks</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
