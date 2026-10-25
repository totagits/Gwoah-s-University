import React from 'react';
import { Building, MapPin, Award, CheckCircle, Shield, Globe } from 'lucide-react';

export const PublicAbout: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Institutional Profile
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
            About Gwoah's University
          </h2>
          <p className="text-slate-400 mt-2 text-base">
            Dedicated to academic rigor, integrity, inclusive scholarship, and sustainable national transformation across the Republic of Liberia.
          </p>
        </div>

        {/* Two Campus Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-850 rounded-2xl p-6 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Capital Campus — Monrovia</h3>
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Montserrado County, Liberia
                </span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Located in the heart of Monrovia, our Capital Campus houses the College of Business & Public Administration, College of Health Sciences, the University Library, ICT data center, and the administrative headquarters of the Registrar and Bursar.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Health Sciences Simulation Lab</span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Central Computing Center</span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Senate Chamber</span>
            </div>
          </div>

          <div className="bg-slate-850 rounded-2xl p-6 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Agro-Technology Campus — Fendall</h3>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Careysburg District, Montserrado
                </span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Spanning 150 acres of agricultural research acreage, the Fendall Campus hosts the College of Agriculture, Forestry & Environmental Studies, Engineering workshop facilities, soils and hydrology testing laboratories, and solar micro-grid installations.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Agronomy Experimental Plots</span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Electrical & Logic Workshop</span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Residential Hostels</span>
            </div>
          </div>
        </div>

        {/* NCHE Accreditation & Governance Callout */}
        <div className="bg-gradient-to-r from-slate-850 to-slate-800 rounded-2xl p-8 border border-amber-500/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Shield className="w-5 h-5" />
                <span>Statutory Accreditation & Regulatory Compliance</span>
              </div>
              <h4 className="text-xl font-bold text-white">
                Certified by the National Commission on Higher Education (NCHE)
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Gwoah's University operates in strict compliance with the National Commission on Higher Education Act of Liberia. All baccalaureate programs adhere to the mandated 120–132 credit semester hour requirement, and student records are maintained in alignment with the Ministry of Education's Education Management Information System (EMIS) tertiary framework.
              </p>
            </div>
            <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-center shrink-0 w-full sm:w-auto">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Institutional Status</div>
              <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
                <CheckCircle className="w-5 h-5" />
                Fully Accredited
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">Reg: NCHE-2026-GU-084</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
