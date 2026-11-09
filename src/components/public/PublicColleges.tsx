import React, { useState } from 'react';
import {
  Briefcase,
  BookOpen,
  GraduationCap,
  HeartPulse,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Scissors,
  Utensils,
  Hammer,
  Shirt,
  Laptop,
  Globe,
  Users,
  ArrowRight,
  ChevronRight,
  Search,
} from 'lucide-react';

export interface ProgramDetail {
  name: string;
  degreeType: string;
  duration: string;
  focus: string;
}

export interface BlestCollege {
  id: string;
  letter: string;
  name: string;
  shortTitle: string;
  icon: React.ElementType;
  description: string;
  departments: string[];
  programs: ProgramDetail[];
}

export const BLEST_COLLEGES: BlestCollege[] = [
  {
    id: 'business',
    letter: 'B',
    name: 'College of Business & Entrepreneurship',
    shortTitle: 'Business & Entrepreneurship',
    icon: Briefcase,
    description:
      'Cultivating visionary ethical business leaders, certified accountants, and innovative startup founders equipped to generate wealth and accelerate commercial development across Liberia and West Africa.',
    departments: [
      'Department of Accounting',
      'Department of Entrepreneurship (Practical Startup Creation & Business Incubation)',
    ],
    programs: [
      {
        name: 'Bachelor of Business Administration in Accounting',
        degreeType: 'B.B.A. Degree',
        duration: '4 Years',
        focus: 'Financial Accounting, Auditing Standards, Cost Accounting, Liberian Tax Law, Corporate Finance',
      },
      {
        name: 'Bachelor of Business Administration in Entrepreneurship',
        degreeType: 'B.B.A. Degree',
        duration: '4 Years',
        focus: 'Venture Incubation, Startup Economics, Small Business Management, Angel & Seed Financing, Innovation Strategy',
      },
    ],
  },
  {
    id: 'liberal_arts',
    letter: 'L',
    name: 'College of Liberal Arts & Social Sciences',
    shortTitle: 'Liberal Arts & Social Sciences',
    icon: BookOpen,
    description:
      'Developing critical thinkers, articulate communicators, and civic leaders grounded in humanities, social inquiry, institutional policy analysis, and cultural awareness.',
    departments: [
      'Department of Humanities & Languages',
      'Department of Communications & Media',
      'Department of Social Sciences & Governance',
    ],
    programs: [
      {
        name: 'Bachelor of Arts in Liberal Arts & Humanities',
        degreeType: 'B.A. Degree',
        duration: '4 Years',
        focus: 'World Literature, Cultural Studies, Ethics, Philosophy of Knowledge, Critical Writing',
      },
      {
        name: 'Bachelor of Arts in Strategic Communications & Media',
        degreeType: 'B.A. Degree',
        duration: '4 Years',
        focus: 'Public Relations, Journalism, Media Literacy, Organizational Communication, Digital Advocacy',
      },
      {
        name: 'Bachelor of Science in Social Sciences & General Studies',
        degreeType: 'B.S. Degree',
        duration: '4 Years',
        focus: 'Sociology, Development Economics, Civic Governance, Public Policy, Community Development',
      },
    ],
  },
  {
    id: 'education',
    letter: 'E',
    name: 'College of Education',
    shortTitle: 'College of Education',
    icon: GraduationCap,
    description:
      'Preparing world-class educators, school supervisors, curriculum specialists, and pedagogical leaders who inspire transformative teaching from early childhood through secondary institutions.',
    departments: [
      'Department of Early Childhood Education',
      'Department of Elementary Education',
      'Department of Secondary Education',
    ],
    programs: [
      {
        name: 'Bachelor of Education in Early Childhood Education',
        degreeType: 'B.Ed. Degree',
        duration: '4 Years',
        focus: 'Child Development, Early Literacy, Play-Based Learning, Family & Community Engagement',
      },
      {
        name: 'Bachelor of Education in Elementary Education (Language Arts & Social Studies)',
        degreeType: 'B.Ed. Degree',
        duration: '4 Years',
        focus: 'Reading Pedagogy, West African Social Studies, Classroom Management, Learning Assessments',
      },
      {
        name: 'Bachelor of Education in Elementary Education (Math & Science)',
        degreeType: 'B.Ed. Degree',
        duration: '4 Years',
        focus: 'Foundational Mathematics, Hands-On Primary Science, Inquiry Instruction, STEM Curriculum',
      },
      {
        name: 'Bachelor of Education in Secondary Education (Mathematics Focus)',
        degreeType: 'B.Ed. Degree',
        duration: '4 Years',
        focus: 'Algebra, Geometry, Calculus Pedagogy, WASSCE Exam Preparation, Secondary School Methods',
      },
      {
        name: 'Bachelor of Education in Secondary Education (English Focus)',
        degreeType: 'B.Ed. Degree',
        duration: '4 Years',
        focus: 'Grammar, Literature in English, Rhetoric, Composition Pedagogy, Secondary Teaching Practicum',
      },
    ],
  },
  {
    id: 'science_tech',
    letter: 'S',
    name: 'College of Science, Technology & Allied Health',
    shortTitle: 'Science, Technology & Allied Health',
    icon: HeartPulse,
    description:
      'Addressing critical shortages in healthcare delivery and computing technology through rigorous clinical simulations, laboratory diagnostics, and modern digital software systems.',
    departments: [
      'Department of Information Technology & Computing',
      'Department of Nursing & Allied Health Sciences',
      'Department of Environmental & Laboratory Sciences',
    ],
    programs: [
      {
        name: 'Bachelor of Science in Information Technology (IT)',
        degreeType: 'B.S. Degree',
        duration: '4 Years',
        focus: 'Software Engineering, Cloud Computing, Database Administration, Network Architecture, Cybersecurity',
      },
      {
        name: 'Bachelor of Science in Science and Technology',
        degreeType: 'B.S. Degree',
        duration: '4 Years',
        focus: 'Applied Physical Sciences, Computational Analysis, Technological Research, Innovation Systems',
      },
      {
        name: 'Bachelor of Science in Nursing (BSN)',
        degreeType: 'B.S. Degree',
        duration: '4 Years',
        focus: 'Clinical Patient Care, Maternal & Child Health, Pharmacology, Community Health, Emergency Nursing',
      },
      {
        name: 'Bachelor of Science in Laboratory Science',
        degreeType: 'B.S. Degree',
        duration: '4 Years',
        focus: 'Clinical Chemistry, Medical Microbiology, Hematology, Molecular Diagnostics, Pathology',
      },
      {
        name: 'Bachelor of Science in Environmental Science',
        degreeType: 'B.S. Degree',
        duration: '4 Years',
        focus: 'Ecological Conservation, Climate Adaptation, Water Sanitation, Environmental Impact Assessment',
      },
      {
        name: 'Bachelor of Science in Health Administration',
        degreeType: 'B.S. Degree',
        duration: '4 Years',
        focus: 'Hospital Management, Public Health Policy, Health Informatics, Healthcare Finance & Logistics',
      },
    ],
  },
  {
    id: 'theology',
    letter: 'T',
    name: 'College of Theology & Ministry',
    shortTitle: 'Theology & Ministry',
    icon: Award,
    description:
      'Rooted in orthodox biblical scholarship and Christ-centered servant leadership, equipping ministers, counselors, Christian educators, and global missionaries for faithful service in church and society.',
    departments: [
      'Department of Christian Education',
      'Department of Christian Counseling',
      'Department of Missions & Global Evangelism',
    ],
    programs: [
      {
        name: 'Bachelor of Theology in Christian Education',
        degreeType: 'B.Th. Degree',
        duration: '4 Years',
        focus: 'Biblical Pedagogy, Sunday School Leadership, Discipleship Curriculum, Spiritual Formation',
      },
      {
        name: 'Bachelor of Theology in Christian Counseling',
        degreeType: 'B.Th. Degree',
        duration: '4 Years',
        focus: 'Pastoral Care, Marriage & Family Guidance, Trauma Recovery, Crisis Counseling, Christian Ethics',
      },
      {
        name: 'Bachelor of Theology in Missions & Global Evangelism',
        degreeType: 'B.Th. Degree',
        duration: '4 Years',
        focus: 'Cross-Cultural Missions, Church Planting, Global Evangelism Strategies, Biblical Theology',
      },
    ],
  },
];

const TVET_TRACKS = [
  {
    name: 'Cosmetology & Aesthetic Sciences',
    desc: 'Professional salon management, modern hair styling, aesthetic skin treatments, and beauty business operations.',
    icon: Scissors,
    duration: '6–12 Months Certificate',
  },
  {
    name: 'Catering and Pastry Arts',
    desc: 'Commercial culinary arts, industrial pastry baking, food safety certification, and hospitality catering enterprise.',
    icon: Utensils,
    duration: '6–12 Months Certificate',
  },
  {
    name: 'Tailoring & Garment Construction',
    desc: 'Pattern drafting, modern African and Western fashion design, textile craftsmanship, and commercial garment manufacturing.',
    icon: Shirt,
    duration: '6–12 Months Certificate',
  },
  {
    name: 'Carpentry & Architectural Woodworks',
    desc: 'Joinery, building framing, modern timber furniture production, structural carpentry, and workshop management.',
    icon: Hammer,
    duration: '6–12 Months Certificate',
  },
];

const SPECIALIZED_PROGRAMS = [
  {
    title: 'Harvest Honor Program',
    desc: 'Accelerated academic curriculum, faculty mentorship, and merit distinction for undergraduate scholars maintaining outstanding GPA standing.',
    icon: Sparkles,
  },
  {
    title: 'Harvest Young Entrepreneurs',
    desc: 'On-campus business incubator providing venture modeling, seed mentorship, and competitive pitch showcases to transform students into job creators.',
    icon: Briefcase,
  },
  {
    title: 'Global Exchange & Internships',
    desc: 'Structured corporate internship placements with top employers in Liberia, plus international study-abroad and academic exchange options.',
    icon: Globe,
  },
  {
    title: 'Online & Hybrid Learning',
    desc: 'Flexible, Christ-centered virtual learning platform enabling working professionals across Liberia and Africa to pursue degrees digitally.',
    icon: Laptop,
  },
];

export const degreeSlug = (name: string) =>
  name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const resolvePublicDegree = (route: string) => {
  for (const college of BLEST_COLLEGES) {
    for (const program of college.programs) {
      if (`${college.id}--${degreeSlug(program.name)}` === route)
        return { college, program, route };
    }
  }
  return null;
};

export const PublicColleges: React.FC<{initialCollegeId?: string}> = ({initialCollegeId='business'}) => {
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(initialCollegeId);
  const [query, setQuery] = useState('');
  const activeCollege = BLEST_COLLEGES.find(college => college.id === selectedCollegeId) || BLEST_COLLEGES[0];
  const matchingPrograms = activeCollege.programs.filter(program =>
    [program.name, program.degreeType, program.focus].some(value =>
      value.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  );
  const allPrograms = BLEST_COLLEGES.reduce((total, college) => total + college.programs.length, 0);
  const degreeLink = (program:ProgramDetail) => '#degree=' + activeCollege.id + '--' + degreeSlug(program.name);

  return (
    <section id="colleges" aria-labelledby="hiau-academics-title" className="scroll-mt-28 bg-white text-[#301337]">
      {/* Editorial header: clear information hierarchy rather than a competing mega-banner */}
      <div className="border-b border-[#eadfeb] bg-[#faf8fb]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-center lg:gap-12 lg:px-10">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#946b2c]">
              Academics at HIAU
            </p>
            <h2 id="hiau-academics-title" className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#4a1249] sm:text-5xl lg:text-6xl">
              Find your academic path
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Explore the colleges, academic disciplines and proposed degree paths
              described by Harvest Intercontinental American University.
              Academic requirements and current program availability should be confirmed
              with the university before applying.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#hiau-college-directory" className="inline-flex items-center gap-2 rounded-md bg-[#4a1249] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#681a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]">
                Explore academic colleges <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#hiau-applied-learning" className="inline-flex items-center gap-2 rounded-md border border-[#cdb6d1] bg-white px-5 py-3 text-sm font-bold text-[#4a1249] hover:bg-[#f4edf5]">
                Learning experience <ChevronRight className="h-4 w-4" aria-hidden="true"/>
              </a>
            </div>
          </div>
          <figure className="overflow-hidden rounded-xl bg-[#2a082c] shadow-md">
            <img
              src="/assets/aistudio/image_51d124f3.png"
              alt="HIAU students in an instructional computing classroom"
              className="aspect-[4/3] w-full object-cover"
              fetchPriority="high"
            />
            <figcaption className="bg-white px-4 py-2.5 text-xs font-medium text-slate-600">
              A look inside a HIAU learning space
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Purdue-inspired discoverable academic directory, not a copy of its branding or content */}
      <div id="hiau-college-directory" className="mx-auto max-w-7xl scroll-mt-32 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8dfe9] pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#936a31]">Our academic structure</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#4a1249] sm:text-4xl">Colleges and fields of study</h3>
          </div>
          <span className="text-sm text-slate-600">Five colleges · {allPrograms} listed program descriptions</span>
        </div>
        <div className="mb-8 grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
            HIAU organizes its academic vision through the BLEST framework:
            Business, Liberal Arts, Education, Science &amp; Technology, and Theology.
            The descriptions below are informational; they are not confirmation of
            accreditation or admissions availability for an individual degree.
          </p>
          <img src="/assets/aistudio/image_29eb5504.png"
            alt="HIAU academic campus building" loading="lazy"
            className="aspect-[16/9] w-full rounded-lg object-cover shadow-sm"/>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[270px_minmax(0,1fr)] xl:gap-12">
          <nav aria-label="Select an academic college" className="rounded-xl border border-[#e6dce7] bg-[#faf8fb] p-3 lg:sticky lg:top-28">
            <p className="px-3 pb-3 pt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#946b2c]">
              Browse by college
            </p>
            <div className="space-y-1">
              {BLEST_COLLEGES.map(college => {
                const Icon=college.icon;
                const active=college.id===selectedCollegeId;
                return (
                  <button type="button" key={college.id} onClick={()=>{setSelectedCollegeId(college.id);setQuery('');}}
                    aria-current={active?'true':undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249] ${active?'bg-[#4a1249] text-white':'text-[#39223c] hover:bg-[#efe5f0]'}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${active?'bg-white/15 text-white':'bg-white text-[#4a1249]'}`}>
                      <Icon className="h-4 w-4" aria-hidden="true"/>
                    </span>
                    <span className="min-w-0 flex-1">{college.shortTitle}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true"/>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="min-w-0">
            <div className="border-b-2 border-[#c39a53] pb-6">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#956a32]">Academic college</p>
              <h4 className="mt-2 text-2xl font-bold tracking-tight text-[#4a1249] sm:text-3xl">{activeCollege.name}</h4>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">{activeCollege.description}</p>
            </div>
            <div className="mt-7">
              <h5 className="text-lg font-bold text-[#35103b]">Departments and academic areas</h5>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {activeCollege.departments.map(department=>(
                  <li key={department} className="flex items-start gap-2 border-l-2 border-[#c39a53] bg-[#faf8fb] px-3 py-3 text-sm text-slate-700">
                    <span>{department}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h5 className="text-xl font-bold text-[#35103b]">Explore degree programs</h5>
                  <p className="mt-1 text-sm text-slate-600">Program information is subject to university verification.</p>
                </div>
                <label className="relative block w-full sm:w-64">
                  <span className="sr-only">Search programs in selected college</span>
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" aria-hidden="true"/>
                  <input type="search" value={query} onChange={event=>setQuery(event.target.value)}
                    placeholder="Search programs"
                    className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-[#35103b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]"/>
                </label>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {matchingPrograms.map(program=>(
                  <article key={program.name} className="group h-full rounded-lg border border-[#e4dce5] bg-white transition-colors hover:border-[#a684aa] hover:bg-[#fcfafc] focus-within:border-[#4a1249] focus-within:ring-2 focus-within:ring-[#4a1249]/20">
                    <a href={degreeLink(program)} className="flex h-full flex-col p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]" aria-label={`Explore ${program.name} degree details`}>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#916a37]">{program.degreeType} · {program.duration}</p>
                      <h6 className="mt-3 text-lg font-semibold leading-snug text-[#35103b] group-hover:underline">{program.name}</h6>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">{program.focus}</p>
                      <span className="mt-5 inline-flex items-center gap-2 border-t border-[#eee8ee] pt-3 text-sm font-bold text-[#4a1249]">
                        Explore this degree <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </a>
                  </article>
                ))}
              </div>
              {matchingPrograms.length===0&&<p role="status" className="mt-5 rounded-lg bg-[#faf8fb] p-7 text-center text-sm text-slate-600">No programs match this search within the selected college.</p>}
            </div>
          </div>
        </div>
      </div>

      <section id="hiau-applied-learning" aria-labelledby="hiau-learning-title" className="scroll-mt-32 border-y border-[#e7dce8] bg-[#faf8fb]">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:px-10">
          <div className="overflow-hidden rounded-lg bg-[#4a1249]">
            <img src="/assets/aistudio/image_51d124f3.png"
              alt="Students attending an instructional session in a computer classroom at HIAU"
              loading="lazy" className="aspect-[4/3] w-full object-cover"/>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#956a32]">Academic experience</p>
            <h3 id="hiau-learning-title" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#4a1249] sm:text-4xl">
              Learning through practice
            </h3>
            <p className="mt-5 text-base leading-relaxed text-slate-700">
              Classroom activities, laboratory instruction and practical coursework support the academic experience.
              Speak with the relevant college to learn which facilities, clinical placements and learning options
              are currently available for your chosen program.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <section aria-labelledby="hiau-tvet-heading">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#956a32]">Skills and professional learning</p>
            <h3 id="hiau-tvet-heading" className="mt-2 text-2xl font-bold text-[#4a1249]">Technical and vocational pathways</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">Explore the vocational tracks described in HIAU's academic framework. Confirm intake dates, certificates and current availability before enrolling.</p>
            <div className="mt-5 divide-y divide-[#e6dce7] border-y border-[#e6dce7]">
              {TVET_TRACKS.map(track=>{
                const Icon=track.icon;
                return <article key={track.name} className="flex items-start gap-3 py-4">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-[#956a32]" aria-hidden="true"/>
                  <div><h4 className="font-semibold text-[#35103b]">{track.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">{track.desc}</p>
                    <p className="mt-1 text-xs text-slate-500">{track.duration} · Subject to confirmation</p>
                  </div>
                </article>;
              })}
            </div>
          </section>
          <section aria-labelledby="hiau-initiatives-heading">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#956a32]">Beyond the classroom</p>
            <h3 id="hiau-initiatives-heading" className="mt-2 text-2xl font-bold text-[#4a1249]">Academic enrichment</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">HIAU's described enrichment initiatives support academic exploration and professional development. Verify active participation options with the university.</p>
            <div className="mt-5 divide-y divide-[#e6dce7] border-y border-[#e6dce7]">
              {SPECIALIZED_PROGRAMS.map(program=>{
                const Icon=program.icon;
                return <article key={program.title} className="flex items-start gap-3 py-4">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-[#956a32]" aria-hidden="true"/>
                  <div><h4 className="font-semibold text-[#35103b]">{program.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{program.desc}</p>
                  </div>
                </article>;
              })}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};
