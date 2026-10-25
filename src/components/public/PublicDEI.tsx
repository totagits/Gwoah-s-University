import React from 'react';
import {
  HeartHandshake,
  ShieldAlert,
  Accessibility,
  WifiOff,
  Users,
  CheckCircle2,
  FileCheck,
  PhoneCall,
} from 'lucide-react';

export const PublicDEI: React.FC = () => {
  return (
    <section id="dei" className="py-16 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Equity & Access
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
            Liberia Higher Education DEI Policy Commitment
          </h2>
          <p className="text-slate-400 mt-2 text-base">
            Gwoah's University adheres to the Ministry of Education's <em>Diversity, Equity, and Inclusion Policy in Higher Education (Adopted 31 October 2024)</em>, embedding equal opportunities, universal design, and safe reporting into our platform.
          </p>
        </div>

        {/* 4 Pillars of DEI & Resilience */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 w-fit mb-4">
              <Accessibility className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Disability Accommodation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Targeting WCAG 2.2 AA accessibility standards across the ERP portal, with specialized accommodations for screen-readers, accessible exam formats, and physical campus wheelchair ramps.
            </p>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Gender Parity in STEM</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Targeted mentorship and scholarship aid for young Liberian women pursuing Engineering, Computer Science, and Agronomy, tracked continuously in our institutional analytics hub.
            </p>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 w-fit mb-4">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Low-Bandwidth Resilience</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed specifically for Liberia's connectivity realities: compressed assets, offline-tolerant forms, cached registration receipts, and offline campus sync servers.
            </p>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 w-fit mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Confidential Safeguarding</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Safe, confidential reporting for student harassment, discrimination, or grievance escalations, monitored directly by the Office of the President and Dean of Student Affairs.
            </p>
          </div>
        </div>

        {/* Support Hotline banner */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Student Welfare & Accessibility Desk</div>
              <div className="text-xs text-slate-400">Available Monday - Friday, 8:00 AM - 5:00 PM GMT</div>
            </div>
          </div>
          <div className="text-xs text-slate-300 flex items-center gap-4">
            <span className="font-mono bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-400 font-semibold">
              +231 776 500 112 (Monrovia)
            </span>
            <span className="font-mono bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-400 font-semibold">
              dei@gwoah.edu.lr
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
