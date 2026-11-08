import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Globe, Lock, GraduationCap } from 'lucide-react';

interface PublicFooterProps {
  onOpenPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenProfile?: (profileId: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onOpenPortal,
  onNavigateSection,
  onOpenProfile,
}) => {
  return (
    <footer className="bg-[#4A1249] text-purple-100 border-t-2 border-[#C39A53] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Charter */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white">
              <img
                src="/assets/aistudio/image_bfcc4a11.png"
                alt="Harvest Intercontinental American University Seal"
                className="w-12 h-12 object-contain bg-white rounded-full p-1"
              />
              <div>
                <span className="text-lg font-collegiate font-black tracking-tight text-white block uppercase">
                  Harvest Intercontinental
                </span>
                <span className="text-xs font-collegiate font-bold text-[#C39A53] block uppercase">
                  American University
                </span>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Chartered degree-granting higher education institution in the Republic of Liberia. Founded by Harvest Intercontinental Ministries Unlimited (HIM-U) under the visionary leadership of Bishop Dr. Darlingston G. Johnson.
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#C39A53]" />
                <span>NCHE Statutory Licensure & Charter</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-200 font-bold text-[11px] uppercase tracking-wide">
                <GraduationCap className="w-4 h-4 text-[#C39A53]" />
                <span>Academic Partner: Oral Roberts University (USA)</span>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <button
                onClick={() => onOpenProfile?.('chancellor')}
                className="text-[#C39A53] hover:text-amber-200 underline cursor-pointer"
              >
                Founder & Chancellor Profile →
              </button>
              <button
                onClick={() => onOpenProfile?.('president')}
                className="text-purple-200 hover:text-white underline cursor-pointer"
              >
                President's Message →
              </button>
            </div>
          </div>

          {/* Col 2: Official Campus Locations & Offices */}
          <div className="space-y-2">
            <h4 className="text-sm font-collegiate font-bold text-white uppercase tracking-wider">
              Campus & Office Locations
            </h4>
            <div className="space-y-3 pt-1">
              <div>
                <div className="font-bold text-[#C39A53] text-xs uppercase tracking-wide">
                  Main Academic Campus
                </div>
                <div className="text-[11px] text-slate-300 flex items-start gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C39A53] shrink-0 mt-0.5" />
                  <span>Old Road, Chugbor, Monrovia, Montserrado County, Republic of Liberia</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-[#C39A53] text-xs uppercase tracking-wide">
                  Corporate / Administrative Office
                </div>
                <div className="text-[11px] text-slate-300 flex items-start gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
                  <span>Tubman Boulevard, 6th Street, Sinkor, Monrovia, Liberia</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-[#C39A53] text-xs uppercase tracking-wide">
                  United States Liaison Office
                </div>
                <div className="text-[11px] text-slate-300 flex items-start gap-1.5 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
                  <span>Olney, Maryland, United States of America</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Official Directory & Communications */}
          <div className="space-y-2">
            <h4 className="text-sm font-collegiate font-bold text-white uppercase tracking-wider">
              Contact Directory
            </h4>
            <div className="space-y-2 pt-1 text-slate-300 text-xs">
              <div className="font-bold text-[#C39A53] text-[11px] uppercase tracking-wide">
                Direct Telephone Lines:
              </div>
              <ul className="space-y-1 font-mono text-[11px]">
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C39A53]" />
                  <span>(+231) 888-655-544</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C39A53]" />
                  <span>(+231) 770-458-547</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C39A53]" />
                  <span>(+231) 886-259-509</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C39A53]" />
                  <span>(+231) 770-413-069</span>
                </li>
              </ul>

              <div className="font-bold text-[#C39A53] text-[11px] uppercase tracking-wide pt-1">
                Official Inquiries:
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C39A53]" />
                  <a href="mailto:info@hiau.org.lr" className="hover:text-[#C39A53] transition-colors">
                    info@hiau.org.lr
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C39A53]" />
                  <a href="mailto:info@hiauniversity.org" className="hover:text-[#C39A53] transition-colors">
                    info@hiauniversity.org
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Academic & Intranet Gateway */}
          <div className="space-y-2">
            <h4 className="text-sm font-collegiate font-bold text-white uppercase tracking-wider">
              Academics & ERP Gateway
            </h4>
            <ul className="space-y-1.5 pt-1">
              <li>
                <button onClick={() => onNavigateSection('colleges')} className="hover:text-[#C39A53] transition-colors cursor-pointer text-left">
                  The BLEST College Framework
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('colleges')} className="hover:text-[#C39A53] transition-colors cursor-pointer text-left">
                  TVET Vocational Certificate Tracks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('admissions')} className="hover:text-[#C39A53] transition-colors cursor-pointer text-left">
                  Undergraduate Admissions ($10 Exam)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('tour')} className="hover:text-[#C39A53] transition-colors cursor-pointer text-left">
                  Campus & Smart Classroom Video Tour
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('dei')} className="hover:text-[#C39A53] transition-colors cursor-pointer text-left">
                  Spiritual Fellowship & Student Leadership
                </button>
              </li>
              <li className="pt-3 border-t border-purple-800/60">
                <button
                  onClick={onOpenPortal}
                  className="flex items-center gap-1.5 text-purple-300 hover:text-[#C39A53] font-medium tracking-wide cursor-pointer text-[11px] group"
                  title="Restricted to authorized faculty, administration, and university staff"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C39A53] group-hover:scale-110 transition-transform" />
                  <span>Faculty & Staff Intranet Gateway (Credentials Required)</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-[#C39A53]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-purple-200">
          <div>
            © {new Date().getFullYear()} Harvest Intercontinental American University (HIAU). All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span className="text-[#C39A53] font-bold">HIAU Purple (#4A1249), Gold (#C39A53) & White</span>
            <span>•</span>
            <span>National Commission on Higher Education (NCHE) Chartered</span>
            <span>•</span>
            <span>Oral Roberts University Partner</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
