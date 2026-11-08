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
} from 'lucide-react';

interface ProgramDetail {
  name: string;
  degreeType: string;
  duration: string;
  focus: string;
}

interface BlestCollege {
  id: string;
  letter: string;
  name: string;
  shortTitle: string;
  icon: React.ElementType;
  description: string;
  departments: string[];
  programs: ProgramDetail[];
}

const BLEST_COLLEGES: BlestCollege[] = [
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

export const PublicColleges: React.FC = () => {
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('business');

  const activeCollege = BLEST_COLLEGES.find((c) => c.id === selectedCollegeId) || BLEST_COLLEGES[0];

  return (
    <section id="colleges" className="py-16 bg-[#FAF8FB] text-[#2E0F34] border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with BLEST Acronym */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C39A53] bg-[#4A1249] px-3.5 py-1.5 rounded-full border border-[#C39A53]/30 shadow-xs">
            Academic Offerings & Degree Programs
          </span>
          <h2 className="text-4xl sm:text-5xl font-collegiate font-black mt-3 tracking-tight text-[#4A1249]">
            THE BLEST COLLEGE FRAMEWORK
          </h2>
          <p className="text-slate-600 mt-2 text-base leading-relaxed">
            Harvest Intercontinental American University organizes its degree-granting faculties under the proprietary <strong>BLEST</strong> system: Business, Liberal Arts, Education, Science & Technology, and Theology.
          </p>
        </div>

        {/* Real Classroom & Computing Lab Feature Banner */}
        <div className="mb-10 rounded-xl overflow-hidden border border-purple-200/80 shadow-md bg-white grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-5 h-64 md:h-full min-h-[250px] relative overflow-hidden bg-[#2A082C]">
            <img
              src="/assets/aistudio/image_51d124f3.png"
              alt="HIAU Computer and Digital Language Lab with Students"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 left-2 bg-[#4A1249]/95 text-[#C39A53] border border-[#C39A53]/50 px-2.5 py-1 rounded text-[10px] font-collegiate font-bold uppercase tracking-wider backdrop-blur-md shadow">
              Interactive Digital Lab & Smart Classroom
            </div>
          </div>
          <div className="md:col-span-7 p-6 sm:p-8 text-[#2E0F34] space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C39A53] bg-[#FAF4FB] border border-[#4A1249]/20 px-2.5 py-1 rounded inline-block">
              Applied Learning & Interactive Instruction
            </span>
            <h3 className="text-xl sm:text-2xl font-collegiate font-black uppercase tracking-tight text-[#4A1249]">
              LABORATORY COMPUTING & MULTIMEDIA INSTRUCTION
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Equipped with individualized laptop stations, fast Starlink connectivity, and interactive projection, our classrooms connect scholars directly with software engineering, business case modeling, and applied clinical simulations.
            </p>
          </div>
        </div>

        {/* BLEST Segmented Tabs Control */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {BLEST_COLLEGES.map((col) => {
            const Icon = col.icon;
            const isSelected = selectedCollegeId === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setSelectedCollegeId(col.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4A1249] text-[#C39A53] shadow-md border-2 border-[#C39A53]'
                    : 'bg-white text-slate-700 hover:text-[#4A1249] hover:bg-purple-50 border border-purple-200/60 shadow-xs'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                    isSelected ? 'bg-[#C39A53] text-[#2A082C]' : 'bg-purple-100 text-[#4A1249]'
                  }`}
                >
                  {col.letter}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C39A53]' : 'text-[#4A1249]'}`} />
                <span>{col.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active BLEST College Detail Showcase */}
        <div className="bg-white border border-purple-200/80 rounded-xl p-6 sm:p-8 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-purple-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C39A53]">
                <span className="w-5 h-5 rounded-full bg-[#4A1249] text-[#C39A53] flex items-center justify-center font-black">
                  {activeCollege.letter}
                </span>
                <span>The BLEST Framework • National Commission on Higher Education Certified</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-collegiate font-black text-[#4A1249] mt-1 tracking-tight">
                {activeCollege.name.toUpperCase()}
              </h3>
              <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
                {activeCollege.description}
              </p>
            </div>
            <div className="bg-[#FAF4FB] text-[#4A1249] px-4 py-2 rounded text-xs font-bold border border-purple-200 shrink-0">
              Statutory 120–132 Semester Credits
            </div>
          </div>

          {/* Departments Included in College */}
          <div className="my-5 p-4 rounded-lg bg-[#FAF8FB] border border-purple-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A1249] block mb-2">
              Academic Departments in this Faculty:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeCollege.departments.map((dept, i) => (
                <span
                  key={i}
                  className="bg-white text-slate-800 px-3 py-1.5 rounded text-xs font-semibold border border-purple-200 shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C39A53]" />
                  <span>{dept}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {activeCollege.programs.map((prog, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8FB] border border-purple-200/80 border-t-4 border-t-[#4A1249] hover:border-[#C39A53] rounded-lg p-5 transition-all group shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1 text-[#4A1249] font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#C39A53]" /> {prog.duration}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded text-[11px] font-mono font-bold text-[#4A1249] border border-purple-200">
                      {prog.degreeType}
                    </span>
                  </div>
                  <h4 className="text-base font-collegiate font-bold text-[#4A1249] group-hover:text-[#661B69] transition-colors tracking-tight">
                    {prog.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    <span className="text-[#4A1249] font-bold">Curriculum Focus:</span> {prog.focus}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-[#4A1249] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C39A53]" /> NCHE Accredited
                  </span>
                  <span className="font-medium text-[#C39A53]">Semester I & II Intake</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TVET Technical & Vocational Programs Section */}
        <div className="mb-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C39A53]">
              Hands-On Career Skills
            </span>
            <h3 className="text-2xl sm:text-3xl font-collegiate font-black text-[#4A1249] uppercase tracking-tight mt-1">
              TECHNICAL & VOCATIONAL EDUCATION TRAINING (TVET)
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Practical certificate qualifications providing market-ready vocational skills for self-employment, job creation, and micro-enterprise growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TVET_TRACKS.map((tvet, idx) => {
              const Icon = tvet.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-purple-200/80 border-t-4 border-t-[#C39A53] rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#FAF4E8] text-[#A17A32] border border-[#C39A53]/30 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-[#C39A53]" />
                    </div>
                    <h4 className="text-sm font-collegiate font-bold text-[#4A1249] uppercase tracking-tight mb-2">
                      {tvet.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {tvet.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">{tvet.duration}</span>
                    <span className="text-[#C39A53] font-bold">Certificate</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Specialized Academic Programs Grid */}
        <div className="bg-[#4A1249] text-white rounded-xl p-6 sm:p-8 border-2 border-[#C39A53]/60 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C39A53]">
              Enrichment & Global Horizons
            </span>
            <h3 className="text-2xl sm:text-3xl font-collegiate font-black text-white uppercase tracking-tight mt-1">
              SPECIALIZED ACADEMIC INITIATIVES
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SPECIALIZED_PROGRAMS.map((prog, idx) => {
              const Icon = prog.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#2A082C] border border-[#C39A53]/40 rounded-lg p-5 flex flex-col justify-between hover:border-[#C39A53] transition-colors"
                >
                  <div>
                    <div className="w-9 h-9 rounded bg-[#4A1249] text-[#C39A53] flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-collegiate font-bold text-[#C39A53] uppercase tracking-tight mb-2">
                      {prog.title}
                    </h4>
                    <p className="text-xs text-purple-100 leading-relaxed">
                      {prog.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-[#C39A53]">
                    Active HIAU Track
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
