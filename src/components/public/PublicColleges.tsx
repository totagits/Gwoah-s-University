import React, { useState } from 'react';
import {
  Cpu,
  HeartPulse,
  Briefcase,
  Sprout,
  GraduationCap,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

export const PublicColleges: React.FC = () => {
  const [selectedCollege, setSelectedCollege] = useState<string>('engineering');

  const colleges = [
    {
      id: 'engineering',
      name: 'College of Engineering, Technology & Computing',
      dean: 'Prof. Joseph Flomo, Ph.D.',
      icon: Cpu,
      color: 'blue',
      description: 'Preparing engineers and computing specialists with hands-on systems architecture, software engineering, and digital infrastructure skills.',
      programs: [
        { name: 'B.Sc. in Computer Science', credits: 128, duration: '4 Years', focus: 'Software Engineering, Algorithms, Database Systems' },
        { name: 'B.Sc. in Electrical & Telecommunications Engineering', credits: 132, duration: '4 Years', focus: 'Power Systems, Microprocessors, Satellite Networks' },
        { name: 'B.Sc. in Mining & Geological Engineering', credits: 132, duration: '4 Years', focus: 'Mineral Exploration, Geotechnical Analysis, Mine Safety' },
      ],
    },
    {
      id: 'health',
      name: 'College of Health & Allied Medical Sciences',
      dean: 'Dr. Evelyn Korto, MD, MPH',
      icon: HeartPulse,
      color: 'emerald',
      description: 'Training community healthcare leaders, licensed professional nurses, and clinical lab researchers serving hospitals and clinics across Liberia.',
      programs: [
        { name: 'B.Sc. in Nursing (BSN)', credits: 130, duration: '4 Years', focus: 'Maternal Care, Emergency Clinical Medicine, Epidemiology' },
        { name: 'B.Sc. in Public Health & Community Medicine', credits: 124, duration: '4 Years', focus: 'Infectious Disease Control, Sanitation, Health Systems Policy' },
        { name: 'B.Sc. in Medical Laboratory Sciences', credits: 128, duration: '4 Years', focus: 'Clinical Chemistry, Hematology, Molecular Diagnostics' },
      ],
    },
    {
      id: 'business',
      name: 'College of Business & Public Administration',
      dean: 'Dr. Abraham S. Freeman, DBA',
      icon: Briefcase,
      color: 'amber',
      description: 'Fostering ethical fiscal management, corporate governance, economic development, and public sector accountability.',
      programs: [
        { name: 'B.B.A. in Accounting & Financial Forensics', credits: 124, duration: '4 Years', focus: 'Audit Standards, Liberian Tax Law, Cost Accounting' },
        { name: 'B.B.A. in Banking, Finance & Mobile Fintech', credits: 124, duration: '4 Years', focus: 'Central Banking, Mobile Money Ecosystems, Credit Analysis' },
        { name: 'B.P.A. in Public Administration & Policy Governance', credits: 120, duration: '4 Years', focus: 'Civil Service Reform, Public Procurement, National Development' },
      ],
    },
    {
      id: 'agriculture',
      name: 'College of Agriculture & Environmental Studies',
      dean: 'Prof. Varney Dukuly, Ph.D.',
      icon: Sprout,
      color: 'green',
      description: 'Advancing food security, climate-resilient farming, agronomy, and sustainable forestry resource stewardship on our 150-acre Fendall campus.',
      programs: [
        { name: 'B.Sc. in Agronomy & Tropical Crop Production', credits: 126, duration: '4 Years', focus: 'Soil Fertility, Cassava/Rice Breeding, Integrated Pest Management' },
        { name: 'B.Sc. in Agribusiness Management', credits: 122, duration: '4 Years', focus: 'Commodity Value Chains, Farm Economics, Agro-Export Marketing' },
        { name: 'B.Sc. in Sustainable Forestry & Climate Ecology', credits: 126, duration: '4 Years', focus: 'Conservation Biology, Carbon Sequestration, Timber Auditing' },
      ],
    },
    {
      id: 'education',
      name: 'School of Education & Human Development',
      dean: 'Dr. Musu C. Fahnbulleh, Ed.D.',
      icon: GraduationCap,
      color: 'purple',
      description: 'Empowering future secondary school educators, educational technologists, and curriculum specialists in alignment with Ministry of Education priorities.',
      programs: [
        { name: 'B.Ed. in Secondary STEM Education (Mathematics & Physics)', credits: 120, duration: '4 Years', focus: 'Pedagogical Content Knowledge, Lab Demonstrations' },
        { name: 'B.Ed. in Educational Leadership & School Supervision', credits: 120, duration: '4 Years', focus: 'School Administration, Learning Assessment, Inclusive Teaching' },
      ],
    },
  ];

  const activeCollege = colleges.find((c) => c.id === selectedCollege) || colleges[0];

  return (
    <section id="colleges" className="py-16 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Academic Offerings
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
            Colleges & Accredited Programs
          </h2>
          <p className="text-slate-400 mt-2 text-base">
            Every curriculum is registered with the National Commission on Higher Education (NCHE) and structured to produce globally competitive graduates.
          </p>
        </div>

        {/* College Selection Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {colleges.map((col) => {
            const Icon = col.icon;
            const isSelected = selectedCollege === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setSelectedCollege(col.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{col.name.split('&')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected College Detail Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Dean of the Faculty: {activeCollege.dean}
              </div>
              <h3 className="text-2xl font-bold text-white mt-1">
                {activeCollege.name}
              </h3>
              <p className="text-slate-300 text-sm mt-1 max-w-3xl">
                {activeCollege.description}
              </p>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-xl text-xs text-slate-300 border border-slate-700">
              <span className="font-bold text-amber-400">Graduation Requirement:</span> 120–132 Semester Credits
            </div>
          </div>

          {/* Program list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {activeCollege.programs.map((prog, idx) => (
              <div
                key={idx}
                className="bg-slate-850 border border-slate-800/80 hover:border-amber-500/40 rounded-xl p-5 transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> {prog.duration}
                  </span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
                    {prog.credits} Credits
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  {prog.name}
                </h4>
                <p className="text-xs text-slate-400 mt-2">
                  <span className="text-slate-300 font-medium">Core Focus:</span> {prog.focus}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> NCHE Approved
                  </span>
                  <span>Semester I & II Intake</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
