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

// The same portrait treatment is used throughout the public directory.
// A clear placeholder is preferable to a broken image or a misleading
// substitute for an actual HIAU official.
const LeadershipPortrait: React.FC<{ leader: LeaderItem }> = ({ leader }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-[#F2F0F3]">
      {failed ? (
        <div role="img" aria-label={`Photograph unavailable for ${leader.name}`}
          className="flex h-full items-center justify-center px-5 text-center text-sm font-medium text-[#4A1249]">
          Photograph unavailable
        </div>
      ) : (
        <img
          src={leader.image}
          alt={`Portrait of ${leader.name}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};

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

        {/* Institutional background and governance — concise, accessible,
            no unverified assembly photograph and no decorative photo overlays. */}
        <div className="mb-14 grid gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-xl border border-[#E5DEE8] bg-white shadow-sm">
            <img
              src="/assets/aistudio/image_29eb5504.png"
              alt="HIAU campus building in Monrovia"
              loading="lazy"
              decoding="async"
              className="h-52 w-full object-cover sm:h-64"
            />
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#927139]">University background</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#4A1249]">Our foundation and campus</h3>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                HIAU's development began in 2020 with an international task force
                convened through Harvest Intercontinental Ministries Unlimited.
                Its Old Road campus in Monrovia provides a home for academic and
                administrative activities.
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#927139]" />
                Old Road, Chugbor, Monrovia, Liberia
              </p>
            </div>
          </article>
          <article className="rounded-xl border border-[#E5DEE8] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#927139]">Institutional governance</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#4A1249]">Leadership and stewardship</h3>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              The Chancellor, President, Board of Trustees and faculty provide
              academic direction and institutional oversight. Meet the people
              serving HIAU through the leadership directory below.
            </p>
            <dl className="mt-6 divide-y divide-[#EEE8F0] text-sm">
              <div className="py-3">
                <dt className="font-semibold text-[#4A1249]">Chancellor</dt>
                <dd className="mt-1 text-slate-700">Bishop Dr. Darlingston G. Johnson</dd>
              </div>
              <div className="py-3">
                <dt className="font-semibold text-[#4A1249]">President</dt>
                <dd className="mt-1 text-slate-700">Asst. Professor Mamawa M. Freeman-Moore</dd>
              </div>
              <div className="py-3">
                <dt className="font-semibold text-[#4A1249]">Board Chair</dt>
                <dd className="mt-1 text-slate-700">Dr. Jonathan C. Taylor</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
              <button type="button" onClick={() => onOpenProfile?.('chancellor')}
                className="text-sm font-semibold text-[#4A1249] underline-offset-4 hover:underline">
                Chancellor's profile →
              </button>
              <button type="button" onClick={() => onOpenProfile?.('president')}
                className="text-sm font-semibold text-[#4A1249] underline-offset-4 hover:underline">
                President's profile →
              </button>
            </div>
          </article>
        </div>

        {/* One restrained, unified leadership directory for all 19 profiles. */}
        <section aria-labelledby="hiau-leaders-heading" className="mb-14 rounded-xl border border-[#E5DEE8] bg-white px-4 py-8 shadow-sm sm:px-8">
          <div className="flex flex-col gap-5 border-b border-[#EEE8F0] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#927139]">Our people</p>
              <h3 id="hiau-leaders-heading"
                className="mt-2 text-2xl font-bold tracking-tight text-[#4A1249] sm:text-3xl">
                University leadership and faculty
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Explore profiles of university executives, governing trustees and faculty.
              </p>
            </div>
            <div role="group" aria-label="Filter leadership directory"
              className="flex flex-wrap gap-2">
              {([
                ['all', 'All', EXECUTIVE_ADMINISTRATORS.length + BOARD_OF_TRUSTEES.length + PROFESSORS_AND_FACULTY.length],
                ['executive', 'Executives', EXECUTIVE_ADMINISTRATORS.length],
                ['trustee', 'Trustees', BOARD_OF_TRUSTEES.length],
                ['faculty', 'Faculty', PROFESSORS_AND_FACULTY.length],
              ] as const).map(([key,label,count])=>(
                <button key={key} type="button"
                  onClick={() => setActiveLeaderTab(key)}
                  aria-pressed={activeLeaderTab===key}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#927139] ${
                    activeLeaderTab===key
                      ? 'border-[#4A1249] bg-[#4A1249] text-white'
                      : 'border-[#DAD0DE] bg-white text-[#4A1249] hover:bg-[#F7F2F7]'
                  }`}>
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLeaders.map(leader => (
              <article key={leader.id}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E5DEE8] bg-white transition-colors hover:border-[#B699BF]">
                <LeadershipPortrait key={leader.image} leader={leader} />
                <div className="flex flex-1 flex-col p-5">
                  <h4 className="text-base font-bold leading-snug text-[#4A1249]">{leader.name}</h4>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#775789]">{leader.title}</p>
                  <div className="mt-auto pt-5">
                    <button type="button" onClick={() => onOpenProfile?.(leader.id)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A1249] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#927139]"
                      aria-label={`View profile of ${leader.name}`}>
                      View profile <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

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
