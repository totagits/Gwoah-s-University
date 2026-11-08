import React, { useState } from 'react';
import {
  Building,
  MapPin,
  CheckCircle,
  Shield,
  Award,
  Users,
  Camera,
  Compass,
  Sparkles,
  BookOpen,
  HeartHandshake,
  Globe,
  GraduationCap,
} from 'lucide-react';

interface LeaderItem {
  id: string;
  name: string;
  title: string;
  role: string;
  image: string;
  category: 'executive' | 'trustee' | 'faculty';
}

interface PublicAboutProps {
  onOpenProfile?: (profileId: string) => void;
}

const EXECUTIVE_ADMINISTRATORS: LeaderItem[] = [
  {
    id: 'chancellor',
    name: 'Bishop Dr. Darlingston G. Johnson',
    title: 'Founder & Chancellor',
    role: 'Presiding Bishop, Harvest Intercontinental Ministries Unlimited (HIM-U)',
    image: '/assets/images/hiau_chancellor_portrait_1794157550151.jpg',
    category: 'executive',
  },
  {
    id: 'president',
    name: 'Asst. Professor Mamawa M. Freeman-Moore',
    title: 'President of the University',
    role: 'Founding President, Executive Administration & Whole-Person Pedagogy',
    image: '/assets/hiau/prof_mamawa_freeman_moore.png',
    category: 'executive',
  },
  {
    id: 'deputy_chancellor',
    name: 'Dr. Kona-Facia Freeman-Nepay',
    title: 'Founding President & Deputy Chancellor',
    role: 'Head of 2020 BDJEM Task Force, Strategic Global Academic Direction',
    image: '/assets/images/hiau_president_portrait_1794157550124.jpg',
    category: 'executive',
  },
  {
    id: 'board_chair',
    name: 'Dr. Jonathan C. Taylor',
    title: 'Chairman, Board of Trustees',
    role: 'Strategic Institutional Oversight & Fiduciary Governance',
    image: '/assets/images/hiau_chair_portrait_1794157551551.jpg',
    category: 'executive',
  },
  {
    id: 'board_head',
    name: 'Stanton B. Johnson',
    title: 'Global & National Board Head',
    role: 'International Partnerships, Strategic Management & Cross-Functional Teams',
    image: '/assets/hiau/stanton_johnson.jpg',
    category: 'executive',
  },
];

const BOARD_OF_TRUSTEES: LeaderItem[] = [
  {
    id: 'trustee_nelson_williams',
    name: 'Hon. T. Nelson Williams',
    title: 'Trustee (MPA)',
    role: 'Public Administration & Corporate Governance',
    image: '/assets/hiau/trustee_nelson_williams.jpg',
    category: 'trustee',
  },
  {
    id: 'trustee_beoni_uery',
    name: 'Hon. Beoni Uery',
    title: 'Trustee (MSc)',
    role: 'Strategic Planning & University Operations',
    image: '/assets/hiau/trustee_beoni_uery.jpg',
    category: 'trustee',
  },
  {
    id: 'trustee_wolo_belleh',
    name: 'Bishop M. Wolo Belleh',
    title: 'Trustee (THD)',
    role: 'Theological Education & Pastoral Ethics',
    image: '/assets/hiau/trustee_wolo_belleh.jpg',
    category: 'trustee',
  },
  {
    id: 'trustee_augustine_konneh',
    name: 'Hon. Augustine Konneh',
    title: 'Trustee (PhD)',
    role: 'Higher Education Policy & Academic Affairs',
    image: '/assets/hiau/trustee_augustine_konneh.jpg',
    category: 'trustee',
  },
  {
    id: 'trustee_charlyn_brumskin',
    name: 'Cllr. Charlyn Brumskin',
    title: 'Trustee (JD)',
    role: 'Legal Counsel & Regulatory Compliance',
    image: '/assets/hiau/trustee_charlyn_brumskin.jpg',
    category: 'trustee',
  },
  {
    id: 'trustee_carmenia_abdallah',
    name: 'Carmenia Abdallah',
    title: 'Trustee (BSc)',
    role: 'Community Health & Institutional Development',
    image: '/assets/hiau/trustee_carmenia_abdallah.jpg',
    category: 'trustee',
  },
  {
    id: 'trustee_walker_richards',
    name: 'Walker R. Richards',
    title: 'Trustee (M.E.)',
    role: 'Engineering Infrastructure & Technical Systems',
    image: '/assets/hiau/trustee_walker_richards.jpg',
    category: 'trustee',
  },
];

const PROFESSORS_AND_FACULTY: LeaderItem[] = [
  {
    id: 'dr_jacob_meiporkoyah',
    name: 'Dr. Jacob Meiporkoyah, D.Min',
    title: 'Professor of Ministry & Theology',
    role: 'College of Theology • Pastoral Care & Biblical Scholarship',
    image: '/assets/hiau/dr_jacob_meiporkoyah.png',
    category: 'faculty',
  },
  {
    id: 'rev_dr_earl_darlington',
    name: 'Rev. Dr. Earl Orlando Darlington, EdD',
    title: 'Professor of Linguistics & Education',
    role: 'BA, MA (Linguistics), MATS, EdD • Communications & Humanities',
    image: '/assets/hiau/rev_dr_earl_darlington.png',
    category: 'faculty',
  },
  {
    id: 'rev_armah_karmoh',
    name: 'Rev. Armah Karmoh, M.A.',
    title: 'Senior Faculty in Education & Theology',
    role: 'B.A. (Education), B.Th., M.A. (Education) • Teacher Education',
    image: '/assets/hiau/rev_armah_karmoh.png',
    category: 'faculty',
  },
  {
    id: 'dr_timothy_jornkatonor',
    name: 'Dr. Timothy Jornkatonor, M.PH',
    title: 'Faculty in Allied Health & Pharmacy',
    role: 'Pharm. Candi., M.PH • College of Science & Allied Health',
    image: '/assets/hiau/dr_timothy_jornkatonor.jpg',
    category: 'faculty',
  },
  {
    id: 'dr_emmitt_dennis',
    name: 'Dr. Emmitt Dennis',
    title: 'Senior Faculty & Academic Advisor',
    role: 'Higher Education Curriculum & Scientific Research',
    image: '/assets/hiau/dr_emmitt_dennis.jpg',
    category: 'faculty',
  },
  {
    id: 'mr_george_sorbor',
    name: 'Mr. George F. Sorbor',
    title: 'Faculty in Information Technology',
    role: 'College of Science & Technology • Software Systems & Computing',
    image: '/assets/hiau/mr_george_sorbor.jpg',
    category: 'faculty',
  },
  {
    id: 'mr_thomas_gmawlue',
    name: 'Mr. Thomas N. Gmawlue Jr.',
    title: 'Faculty in Business & Entrepreneurship',
    role: 'College of Business • Accounting & Startup Enterprise Incubation',
    image: '/assets/hiau/mr_thomas_gmawlue.jpg',
    category: 'faculty',
  },
];

const CORE_PRINCIPLES = [
  {
    title: 'Integrity',
    desc: 'Uncompromising adherence to moral truth, ethical transparency, and Christ-centered accountability in every academic and administrative endeavor.',
    icon: Shield,
  },
  {
    title: 'Inclusivity',
    desc: 'Welcoming scholars from all 15 counties of Liberia and across Africa, ensuring non-discriminatory access to transformative education regardless of background.',
    icon: Users,
  },
  {
    title: 'Innovation',
    desc: 'Embracing emerging technologies, modern digital computing, and creative problem-solving to address 21st-century continental challenges.',
    icon: Sparkles,
  },
  {
    title: 'Christ-Centered Servant Leadership',
    desc: 'Fostering ethical, servant-hearted leaders committed to honoring God and transforming society through humble, courageous service.',
    icon: HeartHandshake,
  },
  {
    title: 'Social Responsibility',
    desc: 'Equipping graduates with practical entrepreneurship skills to foster sustainable local economies, public health, and civic renewal.',
    icon: Globe,
  },
];

export const PublicAbout: React.FC<PublicAboutProps> = ({ onOpenProfile }) => {
  const [activeLeaderTab, setActiveLeaderTab] = useState<'all' | 'executive' | 'trustee' | 'faculty'>('all');

  const filteredLeaders =
    activeLeaderTab === 'all'
      ? [...EXECUTIVE_ADMINISTRATORS, ...BOARD_OF_TRUSTEES, ...PROFESSORS_AND_FACULTY]
      : activeLeaderTab === 'executive'
      ? EXECUTIVE_ADMINISTRATORS
      : activeLeaderTab === 'trustee'
      ? BOARD_OF_TRUSTEES
      : PROFESSORS_AND_FACULTY;

  return (
    <section id="about" className="py-16 bg-[#FAF8FB] border-b border-purple-100 text-[#2E0F34]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C39A53] bg-[#4A1249] px-3.5 py-1.5 rounded-full border border-[#C39A53]/30 shadow-xs">
            Institutional Identity & Leadership
          </span>
          <h2 className="text-4xl sm:text-5xl font-collegiate font-black mt-3 tracking-tight text-[#4A1249]">
            ABOUT HARVEST INTERCONTINENTAL AMERICAN UNIVERSITY
          </h2>
          <p className="text-slate-600 mt-2 text-base leading-relaxed">
            Bridging the educational divide between developed and developing nations by delivering world-class American-style, Christ-centered, entrepreneurship-driven higher education in Liberia.
          </p>
        </div>

        {/* Vision, Mission & Motto Triple Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Vision */}
          <div className="bg-white border border-purple-200/80 border-t-4 border-t-[#4A1249] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C39A53] mb-2">
              <Compass className="w-4 h-4 text-[#C39A53]" />
              <span>Our Vision</span>
            </div>
            <h3 className="text-xl font-collegiate font-black text-[#4A1249] mb-3">
              "A WORLD WHERE NO ONE LIVES OR DIES WITHOUT ACCESS TO QUALITY EDUCATION."
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We envision a future where geographical and socioeconomic barriers to world-class tertiary education are eliminated through accessible physical and digital campuses.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white border border-purple-200/80 border-t-4 border-t-[#C39A53] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C39A53] mb-2">
              <Sparkles className="w-4 h-4 text-[#C39A53]" />
              <span>Our Mission</span>
            </div>
            <h3 className="text-xl font-collegiate font-black text-[#4A1249] mb-3">
              EMPOWERING FUTURE LEADERS THROUGH WHOLE-PERSON EDUCATION
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              To provide accessible, world-class academic, technical, and vocational education in underdeveloped nations (beginning in Sub-Saharan Africa), empowering students through emerging technologies, entrepreneurship, and developing the total person—spirit, soul, and body.
            </p>
          </div>

          {/* Motto */}
          <div className="bg-white border border-purple-200/80 border-t-4 border-t-[#4A1249] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C39A53] mb-2">
              <BookOpen className="w-4 h-4 text-[#C39A53]" />
              <span>University Motto</span>
            </div>
            <h3 className="text-xl font-collegiate font-black text-[#4A1249] mb-3">
              "EDUCATING THE TOTAL PERSON: MIND, BODY AND SPIRIT, WITH EXCELLENCE IN ENTREPRENEURSHIP SKILLS."
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Cultivating intellectual rigor, physical wellness, spiritual maturity, and hands-on entrepreneurial acumen so graduates become creators of jobs rather than mere seekers of employment.
            </p>
          </div>
        </div>

        {/* Foundational Origin & Real Campus Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Main Campus Complex Card with Real Photo */}
          <div className="bg-white rounded-xl overflow-hidden border border-purple-200/80 border-t-4 border-t-[#4A1249] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#2A082C]">
                <img
                  src="/assets/aistudio/image_29eb5504.png"
                  alt="Harvest Intercontinental American University Campus Building in Monrovia, Liberia"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A082C]/85 via-transparent to-black/20" />
                <div className="absolute top-3 left-3 bg-[#4A1249]/95 text-[#C39A53] border border-[#C39A53]/50 px-2.5 py-1 rounded text-[11px] font-collegiate font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow">
                  <Camera className="w-3 h-3 text-[#C39A53]" />
                  <span>Actual Campus Facility</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#C39A53] block">
                    Main Academic Complex & Headquarters
                  </span>
                  <span className="text-sm font-semibold block truncate">
                    Old Road, Chugbor, Monrovia, Republic of Liberia
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="p-2.5 rounded-lg bg-[#4A1249] text-[#C39A53]">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-collegiate font-bold text-[#4A1249] tracking-tight">
                      FOUNDATIONAL ORIGIN & CAMPUS
                    </h3>
                    <span className="text-xs text-[#C39A53] font-bold flex items-center gap-1 mt-0.5 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 text-[#C39A53]" /> Old Road, Chugbor • Montserrado County
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  In 2020, Bishop Dr. Darlingston G. Johnson (Presiding Bishop of Harvest Intercontinental Ministries Unlimited) mandated an international task force led by Dr. Kona-Facia Freeman-Nepay to establish an American-style, Christ-centered, entrepreneurship-focused university in Liberia. Today, our Old Road complex houses executive offices, registrar chambers, bursar counters, and modern lecture halls.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-[#FAF4FB] text-[#4A1249] px-3 py-1.5 rounded border border-purple-200 font-semibold">Founded 2020 by HIM-U Task Force</span>
                  <span className="bg-[#FAF4FB] text-[#4A1249] px-3 py-1.5 rounded border border-purple-200 font-semibold">Parent: Harvest Intercontinental Ministries Unlimited</span>
                  <span className="bg-[#FAF4FB] text-[#4A1249] px-3 py-1.5 rounded border border-purple-200 font-semibold">Monrovia & Olney, MD Offices</span>
                </div>
              </div>
            </div>
          </div>

          {/* Governance & Leadership Card with Real Photo */}
          <div className="bg-white rounded-xl overflow-hidden border border-purple-200/80 border-t-4 border-t-[#C39A53] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#2A082C]">
                <img
                  src="/assets/aistudio/image_73fb8933.png"
                  alt="HIAU Convocation, Chancellor Bishop Darlingston G. Johnson, and University Senate"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A082C]/85 via-transparent to-black/20" />
                <div className="absolute top-3 left-3 bg-[#4A1249]/95 text-[#C39A53] border border-[#C39A53]/50 px-2.5 py-1 rounded text-[11px] font-collegiate font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow">
                  <Camera className="w-3 h-3 text-[#C39A53]" />
                  <span>Actual Leadership Assembly</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#C39A53] block">
                    Institutional Governance & Leadership
                  </span>
                  <span className="text-sm font-semibold block truncate">
                    Chancellor, Founding President & University Senate
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="p-2.5 rounded-lg bg-[#C39A53] text-[#2A082C]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-collegiate font-bold text-[#4A1249] tracking-tight">
                      EXECUTIVE LEADERSHIP & GOVERNANCE
                    </h3>
                    <span className="text-xs text-[#C39A53] font-bold flex items-center gap-1 mt-0.5 uppercase tracking-wide">
                      <Users className="w-3.5 h-3.5 text-[#C39A53]" /> Chancellor Bishop Dr. Darlingston G. Johnson
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  Governed under the visionary guidance of Founder & Chancellor Bishop Dr. Darlingston G. Johnson, Founding President Dr. Kona-Facia Freeman-Nepay, and Board of Trustees Chairman Dr. Jonathan C. Taylor, HIAU combines rigorous academic governance with Christ-centered spiritual oversight and community transformation.
                </p>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="bg-[#FAF4E8] text-[#A17A32] px-3 py-1.5 rounded border border-[#C39A53]/30 font-semibold">Founder: Bishop Dr. Darlingston G. Johnson</span>
                  <span className="bg-[#FAF4E8] text-[#A17A32] px-3 py-1.5 rounded border border-[#C39A53]/30 font-semibold">President: Asst. Prof. Mamawa M. Freeman-Moore</span>
                  <span className="bg-[#FAF4E8] text-[#A17A32] px-3 py-1.5 rounded border border-[#C39A53]/30 font-semibold">Board Chair: Dr. Jonathan C. Taylor</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-100">
                  <button
                    onClick={() => onOpenProfile?.('chancellor')}
                    className="px-3 py-1.5 bg-[#4A1249] hover:bg-[#661B69] text-white text-xs font-collegiate font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>View Chancellor's Profile</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => onOpenProfile?.('president')}
                    className="px-3 py-1.5 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] text-xs font-collegiate font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>View President's Message</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => onOpenProfile?.('deputy_chancellor')}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#4A1249] text-xs font-collegiate font-bold uppercase tracking-wider rounded transition-colors cursor-pointer border border-purple-200"
                  >
                    <span>Dr. Freeman-Nepay</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL ADMINISTRATORS, PROFESSORS & STAFF PORTRAIT GALLERY (FROM HIAU.ORG.LR) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border-2 border-purple-200/80 p-6 sm:p-10 shadow-lg mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-purple-100 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#4A1249] text-[#C39A53] shadow-xs">
                  <Users className="w-3.5 h-3.5 text-[#C39A53]" />
                  Verified Faculty & Administration
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF4E8] text-[#A17A32] border border-[#C39A53]/30">
                  <Camera className="w-3.5 h-3.5 text-[#C39A53]" />
                  Official HIAU Portraits
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-collegiate font-black text-[#4A1249] uppercase tracking-tight">
                ADMINISTRATORS, PROFESSORS & GOVERNING TRUSTEES
              </h3>
              <p className="text-slate-600 text-sm max-w-2xl mt-1 leading-relaxed">
                Meet the visionary educators, executive administrators, and distinguished professors driving academic excellence and Christ-centered leadership at Harvest Intercontinental American University.
              </p>
            </div>

            {/* Filter segmented buttons */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#FAF4FB] border border-purple-200 rounded-lg">
              <button
                onClick={() => setActiveLeaderTab('all')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeLeaderTab === 'all'
                    ? 'bg-[#4A1249] text-[#C39A53] shadow-xs'
                    : 'text-slate-600 hover:text-[#4A1249]'
                }`}
              >
                All Directory ({EXECUTIVE_ADMINISTRATORS.length + BOARD_OF_TRUSTEES.length + PROFESSORS_AND_FACULTY.length})
              </button>
              <button
                onClick={() => setActiveLeaderTab('executive')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeLeaderTab === 'executive'
                    ? 'bg-[#4A1249] text-[#C39A53] shadow-xs'
                    : 'text-slate-600 hover:text-[#4A1249]'
                }`}
              >
                Executive ({EXECUTIVE_ADMINISTRATORS.length})
              </button>
              <button
                onClick={() => setActiveLeaderTab('trustee')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeLeaderTab === 'trustee'
                    ? 'bg-[#4A1249] text-[#C39A53] shadow-xs'
                    : 'text-slate-600 hover:text-[#4A1249]'
                }`}
              >
                Trustees ({BOARD_OF_TRUSTEES.length})
              </button>
              <button
                onClick={() => setActiveLeaderTab('faculty')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeLeaderTab === 'faculty'
                    ? 'bg-[#4A1249] text-[#C39A53] shadow-xs'
                    : 'text-slate-600 hover:text-[#4A1249]'
                }`}
              >
                Professors ({PROFESSORS_AND_FACULTY.length})
              </button>
            </div>
          </div>

          {/* Leaders Portrait Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredLeaders.map((leader, idx) => (
              <div
                key={idx}
                onClick={() => onOpenProfile?.(leader.id)}
                className="bg-[#FAF8FB] border border-purple-200/80 border-t-4 border-t-[#4A1249] hover:border-[#C39A53] rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenProfile?.(leader.id);
                }}
              >
                <div>
                  {/* Portrait photo frame */}
                  <div className="relative h-64 sm:h-60 w-full overflow-hidden bg-[#2A082C]">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A082C]/90 via-transparent to-black/20" />

                    {/* Category tag */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm border ${
                          leader.category === 'executive'
                            ? 'bg-[#4A1249] text-[#C39A53] border-[#C39A53]/60'
                            : leader.category === 'trustee'
                            ? 'bg-[#C39A53] text-[#2A082C] border-[#2A082C]/30'
                            : 'bg-white/90 text-[#4A1249] border-purple-300'
                        }`}
                      >
                        {leader.category === 'executive'
                          ? 'Executive Leadership'
                          : leader.category === 'trustee'
                          ? 'Board of Trustees'
                          : 'Faculty Professor'}
                      </span>
                    </div>

                    {/* Bottom overlay name on image */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#C39A53] block truncate">
                        {leader.title}
                      </span>
                    </div>
                  </div>

                  {/* Body information */}
                  <div className="p-4 space-y-1.5">
                    <h4 className="text-base font-collegiate font-bold text-[#4A1249] group-hover:text-[#661B69] transition-colors tracking-tight leading-snug">
                      {leader.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#A17A32]">
                      {leader.title}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1 line-clamp-3">
                      {leader.role}
                    </p>
                  </div>
                </div>

                {/* Footer interactive button and verification */}
                <div className="p-3 bg-white border-t border-purple-100 flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProfile?.(leader.id);
                    }}
                    className="w-full py-1.5 px-2 bg-purple-50 hover:bg-[#4A1249] text-[#4A1249] hover:text-[#C39A53] text-[11px] font-collegiate font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5 border border-purple-200 cursor-pointer shadow-2xs"
                  >
                    <span>View Dedicated Profile</span>
                    <span>→</span>
                  </button>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
                    <span className="flex items-center gap-1 text-[#4A1249] font-bold">
                      <CheckCircle className="w-3 h-3 text-[#C39A53]" /> Official Profile
                    </span>
                    <span className="text-[#C39A53] font-bold">HIAU</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Principles Section */}
        <div className="mb-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C39A53]">
              Foundational Values
            </span>
            <h3 className="text-2xl sm:text-3xl font-collegiate font-black text-[#4A1249] uppercase tracking-tight mt-1">
              THE FIVE CORE PRINCIPLES OF HIAU
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {CORE_PRINCIPLES.map((principle, idx) => {
              const Icon = principle.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-purple-200/80 border-t-4 border-t-[#4A1249] rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#4A1249] text-[#C39A53] flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-collegiate font-bold text-[#4A1249] uppercase tracking-tight mb-2">
                      {principle.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {principle.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-purple-100 text-[10px] font-mono text-[#C39A53] font-bold">
                    0{idx + 1} • Principle
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Accreditation & Global Partnership Banners */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NCHE Statutory Accreditation */}
          <div className="bg-[#4A1249] text-white rounded-xl p-7 border-2 border-[#C39A53]/60 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#C39A53] font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-[#C39A53]" />
                <span>Statutory Licensure & Charter</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-collegiate font-bold text-white uppercase tracking-tight">
                NATIONAL COMMISSION ON HIGHER EDUCATION (NCHE)
              </h4>
              <p className="text-purple-100 text-xs sm:text-sm leading-relaxed">
                Harvest Intercontinental American University is officially recognized, approved, and licensed by the Government of the Republic of Liberia through the National Commission on Higher Education (NCHE/RL) as a chartered degree-granting institution.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#C39A53]/30 flex items-center justify-between text-xs">
              <span className="text-[#C39A53] font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#C39A53]" /> Full Degree-Granting Charter
              </span>
              <span className="font-mono text-purple-200 text-[11px]">Republic of Liberia</span>
            </div>
          </div>

          {/* Oral Roberts University Global Partnership */}
          <div className="bg-[#2A082C] text-white rounded-xl p-7 border-2 border-[#C39A53]/60 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#C39A53] font-bold text-xs uppercase tracking-wider">
                <Globe className="w-4 h-4 text-[#C39A53]" />
                <span>Global Academic Partnership</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-collegiate font-bold text-white uppercase tracking-tight">
                ORAL ROBERTS UNIVERSITY (ORU) COLLABORATION
              </h4>
              <p className="text-purple-100 text-xs sm:text-sm leading-relaxed">
                HIAU maintains an institutional academic partnership with Oral Roberts University (Tulsa, Oklahoma, USA). This partnership supports whole-person education ("spirit, mind, and body"), international curriculum benchmarks, shared digital resources, and virtual learning exchange.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#C39A53]/30 flex items-center justify-between text-xs">
              <span className="text-[#C39A53] font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C39A53]" /> Tulsa, Oklahoma, USA
              </span>
              <span className="font-mono text-purple-200 text-[11px]">Whole-Person Education</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
