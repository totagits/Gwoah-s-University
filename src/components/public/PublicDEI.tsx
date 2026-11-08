import React from 'react';
import {
  Accessibility,
  WifiOff,
  Users,
  ShieldAlert,
  PhoneCall,
  Camera,
  HeartHandshake,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const PublicDEI: React.FC = () => {
  return (
    <section id="dei" className="py-16 bg-[#FAF8FB] text-[#2E0F34] border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C39A53] bg-[#4A1249] px-3.5 py-1.5 rounded-full border border-[#C39A53]/30 shadow-xs">
            Student Life, Spiritual Formation & Community
          </span>
          <h2 className="text-4xl sm:text-5xl font-collegiate font-black mt-3 tracking-tight text-[#4A1249]">
            CAMPUS LIFE, EQUITY & SPIRITUAL FORMATION
          </h2>
          <p className="text-slate-600 mt-2 text-base leading-relaxed">
            Harvest Intercontinental American University educates the whole person—spirit, soul, and body—fostering Christ-centered ethical leadership, student mentorship, and non-discriminatory access across all 15 counties of Liberia.
          </p>
        </div>

        {/* Real Student Community Gallery Feature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-xl overflow-hidden border border-purple-200/80 shadow-md bg-white">
            <div className="relative h-60 w-full overflow-hidden bg-[#2A082C]">
              <img
                src="/assets/aistudio/image_d719be56.png"
                alt="HIAU Students in Assembly Hall"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A082C]/85 via-transparent to-black/20" />
              <div className="absolute top-3 left-3 bg-[#4A1249]/95 text-[#C39A53] border border-[#C39A53]/50 px-2.5 py-1 rounded text-[11px] font-collegiate font-bold uppercase tracking-wider backdrop-blur-md shadow flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-[#C39A53]" />
                <span>Actual HIAU Scholars</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-xs font-bold uppercase tracking-wide text-[#C39A53] block">
                  Diverse Cohort Representation
                </span>
                <span className="text-sm font-semibold block truncate">
                  Undergraduates from Across All 15 Counties of Liberia
                </span>
              </div>
            </div>
            <div className="p-4 bg-white text-xs text-slate-600">
              Students wearing official HIAU credentials participate in collaborative academic instruction, peer tutoring, and inclusive student support initiatives.
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-purple-200/80 shadow-md bg-white">
            <div className="relative h-60 w-full overflow-hidden bg-[#2A082C]">
              <img
                src="/assets/aistudio/image_5886efe4.png"
                alt="HIAU Student Leadership and Fellowship Gathering"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A082C]/85 via-transparent to-black/20" />
              <div className="absolute top-3 left-3 bg-[#4A1249]/95 text-[#C39A53] border border-[#C39A53]/50 px-2.5 py-1 rounded text-[11px] font-collegiate font-bold uppercase tracking-wider backdrop-blur-md shadow flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-[#C39A53]" />
                <span>Actual Campus Fellowship</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-xs font-bold uppercase tracking-wide text-[#C39A53] block">
                  Harvest Student Leadership Council
                </span>
                <span className="text-sm font-semibold block truncate">
                  Campus Fellowship under the Purple & Gold "LEADERS" Banner
                </span>
              </div>
            </div>
            <div className="p-4 bg-white text-xs text-slate-600">
              Cultivating Christ-centered ethical leadership, character development, and mutual support under the institutional motto: <em>"Educating the total person: mind, body and spirit."</em>
            </div>
          </div>
        </div>

        {/* 4 Pillars of DEI, Student Welfare & Spiritual Formation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-purple-200/80 border-t-4 border-t-[#4A1249] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="p-3 rounded-lg bg-[#4A1249] text-[#C39A53] w-fit mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-collegiate font-bold text-[#4A1249] mb-2 uppercase tracking-tight">
              Spiritual Formation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Regular chapel fellowship, campus pastoral mentorship, and discipleship curriculum building moral courage and servant-hearted Christian character.
            </p>
          </div>

          <div className="bg-white border border-purple-200/80 border-t-4 border-t-[#C39A53] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="p-3 rounded-lg bg-[#C39A53] text-[#2A082C] w-fit mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-collegiate font-bold text-[#4A1249] mb-2 uppercase tracking-tight">
              Student Leadership Council
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ethical student self-governance representing undergraduate voices, coordinating peer study circles, and organizing civic community service across Monrovia.
            </p>
          </div>

          <div className="bg-white border border-purple-200/80 border-t-4 border-t-[#4A1249] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="p-3 rounded-lg bg-[#4A1249] text-[#C39A53] w-fit mb-4">
              <Accessibility className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-collegiate font-bold text-[#4A1249] mb-2 uppercase tracking-tight">
              Accessible Education
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict compliance with the Ministry of Education DEI in Higher Education framework, with accommodations for physical mobility and diverse learners.
            </p>
          </div>

          <div className="bg-white border border-purple-200/80 border-t-4 border-t-[#C39A53] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="p-3 rounded-lg bg-[#FAF4E8] text-[#A17A32] w-fit mb-4 border border-[#C39A53]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-collegiate font-bold text-[#4A1249] mb-2 uppercase tracking-tight">
              Young Entrepreneurs
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              On-campus business incubation, seed funding pitch competitions, and mentorship enabling scholars to launch sustainable Liberian enterprises.
            </p>
          </div>
        </div>

        {/* Student Welfare & Directory Banner */}
        <div className="bg-[#4A1249] text-white border-2 border-[#C39A53]/50 rounded-xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded bg-[#C39A53] text-[#2A082C]">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-collegiate font-bold text-white uppercase tracking-tight">
                STUDENT AFFAIRS & PASTORAL CARE DESK
              </div>
              <div className="text-xs text-purple-200">Harvest Intercontinental American University • Old Road, Chugbor, Monrovia</div>
            </div>
          </div>
          <div className="text-xs flex flex-wrap items-center gap-3">
            <span className="font-mono bg-[#2A082C] px-3.5 py-1.5 rounded border border-[#C39A53]/40 text-[#C39A53] font-bold">
              (+231) 888-655-544 / 077-045-8547
            </span>
            <span className="font-mono bg-[#2A082C] px-3.5 py-1.5 rounded border border-[#C39A53]/40 text-purple-100 font-bold">
              info@hiau.org.lr
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
