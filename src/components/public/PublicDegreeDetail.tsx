import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, GraduationCap, PlayCircle } from 'lucide-react';
import { resolvePublicDegree } from './PublicColleges';

interface DegreeDetailProps {
  route: string;
  onBack: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const PublicDegreeDetail: React.FC<DegreeDetailProps> = ({route,onBack,onNavigateSection}) => {
  const match=resolvePublicDegree(route);
  if(!match) return <main className="mx-auto min-h-[50vh] max-w-5xl px-5 py-20 sm:px-8">
    <h1 className="text-3xl font-bold text-[#4a1249]">Degree information unavailable</h1>
    <p className="mt-3 text-slate-700">This degree link is not currently listed in HIAU's academic directory.</p>
    <button type="button" onClick={onBack} className="mt-5 inline-flex items-center gap-2 font-semibold text-[#4a1249] underline"><ArrowLeft className="h-4 w-4"/>Return to Academics</button>
  </main>;
  const {college,program}=match;
  const focusAreas=program.focus.split(',').map(area=>area.trim()).filter(Boolean);
  const hasConfirmedCredit=program.name==='Bachelor of Science in Civil Engineering';
  const academicNote=hasConfirmedCredit
    ? 'HIAU has specified a total of 179 credits for Civil Engineering. Its detailed semester-by-semester course sequence is still undergoing Registrar review and has not been published here.'
    : 'Official course codes, semester sequencing, total credits, admission criteria and program availability must be verified with HIAU. Draft curriculum entries are not published degree requirements.';
  return <main id="hiau-degree-detail" className="min-h-screen bg-white text-[#301337]">
    <div className="border-b border-[#e8dfe9] bg-[#faf8fb]">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-[#4a1249] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true"/> All academic programs
        </button>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-5 sm:px-8 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,.85fr)] lg:items-center lg:gap-12 lg:px-10">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#966a32]">{college.name}</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#4a1249] sm:text-4xl lg:text-5xl">{program.name}</h1>
          <p className="mt-4 text-base font-semibold text-[#503353]">{program.degreeType} · {program.duration} listed in the academic directory</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-700">
            Explore a field of study centered on {focusAreas.slice(0,3).join(', ').toLowerCase()}.
            The academic focus areas below reflect HIAU's current program description.
          </p>
          <button type="button" onClick={()=>onNavigateSection('admissions')}
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#4a1249] px-5 py-3 text-sm font-bold text-white hover:bg-[#661b69] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]">
            Contact Admissions <ArrowRight className="h-4 w-4" aria-hidden="true"/>
          </button>
        </div>
        <figure className="overflow-hidden rounded-xl bg-[#2a082c] shadow-md">
          <img src="/assets/aistudio/image_29eb5504.png"
            className="aspect-[4/3] w-full object-cover" alt="HIAU university campus environment"
            loading="eager"/>
          <figcaption className="bg-white px-4 py-3 text-xs font-medium text-slate-600">
            University campus photography · Illustrative of HIAU, not a program-specific facility
          </figcaption>
        </figure>
      </div>
    </div>

    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-16 lg:px-10">
      <div className="min-w-0 space-y-12">
        <section aria-labelledby="degree-overview">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#956a32]">Program overview</p>
          <h2 id="degree-overview" className="mt-2 text-2xl font-bold tracking-tight text-[#35103b] sm:text-3xl">About this degree</h2>
          <p className="mt-5 text-base leading-7 text-slate-700">
            {program.name} is included in the academic offerings described by the {college.name}.
            Its academic emphasis covers {program.focus.toLowerCase()}.
            Prospective students should consult the college or Admissions Office for the
            approved course catalog, entry requirements, academic calendar and available intake.
          </p>
        </section>
        <section aria-labelledby="degree-areas">
          <h2 id="degree-areas" className="text-2xl font-bold tracking-tight text-[#35103b]">Areas of academic focus</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            These are fields highlighted in the existing program description, not a substitute
            for a published course-by-course curriculum.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {focusAreas.map(area=><li key={area} className="flex items-start gap-3 rounded-lg border border-[#e8dfe9] p-4 text-sm font-medium text-[#35103b]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#946b2c]" aria-hidden="true"/>{area}
            </li>)}
          </ul>
        </section>
        <section aria-labelledby="degree-video">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#956a32]">Learn about this field</p>
          <h2 id="degree-video" className="mt-2 text-2xl font-bold tracking-tight text-[#35103b]">Why this degree matters today</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Watch an original narrated explanation of the field, its relevance to the modern world,
            and possible areas of professional development. This educational animation is not
            documentary footage of a particular HIAU degree program.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl bg-[#2a082c]">
            <video key={route} controls preload="metadata" playsInline poster="/assets/aistudio/image_29eb5504.png"
              className="aspect-video w-full object-contain" aria-label={`Narrated educational video about ${program.name}`}>
              <source src={`/assets/degree-clips/${route}.mp4`} type="video/mp4"/>
              Your browser does not support this narrated degree video.
            </video>
          </div>
          <p className="mt-2 text-xs text-slate-600">Original computer-narrated educational explainer · Subject information may change as technology and professional standards develop.</p>
        </section>
      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <section className="rounded-xl border border-[#dfd0e1] bg-[#faf8fb] p-5">
          <div className="flex items-center gap-2 text-[#4a1249]"><GraduationCap className="h-5 w-5" aria-hidden="true"/><h2 className="font-bold">Degree at a glance</h2></div>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="font-semibold text-slate-500">Credential</dt><dd className="mt-1 font-semibold text-[#35103b]">{program.degreeType}</dd></div>
            <div><dt className="font-semibold text-slate-500">Listed duration</dt><dd className="mt-1 font-semibold text-[#35103b]">{program.duration}</dd></div>
            <div><dt className="font-semibold text-slate-500">Academic college</dt><dd className="mt-1 font-semibold text-[#35103b]">{college.name}</dd></div>
            {hasConfirmedCredit&&<div><dt className="font-semibold text-slate-500">University-confirmed credit total</dt><dd className="mt-1 text-xl font-extrabold text-[#4a1249]">179 credits</dd></div>}
          </dl>
          <div className="mt-6 border-t border-[#e2d6e4] pt-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[#4a1249]"><BookOpen className="h-4 w-4" aria-hidden="true"/> Curriculum verification</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-700">{academicNote}</p>
          </div>
        </section>
        <button type="button" onClick={onBack} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4a1249] hover:underline">
          <ArrowLeft className="h-4 w-4"/> Explore another program
        </button>
      </aside>
    </div>
  </main>;
};
