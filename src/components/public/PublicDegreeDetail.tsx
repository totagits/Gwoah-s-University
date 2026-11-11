import React, {useEffect,useState} from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, GraduationCap, PlayCircle } from 'lucide-react';
import { resolvePublicDegree } from './PublicColleges';
import degreeExplainers from '../../../scripts/hiau-degree-video-content.json';
import {PublicDegreeVideo} from './PublicDegreeVideo';

type PublishedDegree = {
  programName:string;programCode:string;credential:string;college:string;
  requiredCredits:number;effectiveYear:string;version:number;releasedAt:string;
  credits:{general:number;college:number;major:number;minor:number;elective:number};
  courses:{code:string;title:string;category:string;credits:number;year:number;semester:number;prerequisites:string}[];
};

interface DegreeDetailProps {
  route: string;
  onBack: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const PublicDegreeDetail: React.FC<DegreeDetailProps> = ({route,onBack,onNavigateSection}) => {
  const [released,setReleased]=useState<PublishedDegree|null>(null);
  const [releaseLoading,setReleaseLoading]=useState(true);
  useEffect(()=>{
    const controller=new AbortController();
    setReleased(null);setReleaseLoading(true);
    void fetch('/api/public/degree-curriculum/'+encodeURIComponent(route),{
      signal:controller.signal,cache:'no-store',
    }).then(async response=>{
      if(!response.ok)throw new Error('Not available');
      const data=await response.json();
      if(!controller.signal.aborted)setReleased(data.published??null);
    }).catch(()=>{if(!controller.signal.aborted)setReleased(null);})
      .finally(()=>{if(!controller.signal.aborted)setReleaseLoading(false);});
    return ()=>controller.abort();
  },[route]);
  const match=resolvePublicDegree(route);
  if(!match) return <main className="mx-auto min-h-[50vh] max-w-5xl px-5 py-20 sm:px-8">
    <h1 className="text-3xl font-bold text-[#4a1249]">Degree information unavailable</h1>
    <p className="mt-3 text-slate-700">This degree link is not currently listed in HIAU's academic directory.</p>
    <button type="button" onClick={onBack} className="mt-5 inline-flex items-center gap-2 font-semibold text-[#4a1249] underline"><ArrowLeft className="h-4 w-4"/>Return to Academics</button>
  </main>;
  const {college,program}=match;
  const explainer=degreeExplainers.degrees.find(item=>item.college===college.id&&item.name===program.name);
  const focusAreas=program.focus.split(',').map(area=>area.trim()).filter(Boolean);
  const hasConfirmedCredit=program.name==='Bachelor of Science in Civil Engineering';
  const degreeVideoSource=`/api/public/video/${encodeURIComponent(route)}`;
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
            className="aspect-[4/3] w-full object-cover" alt="Illustrative university campus scene"
            loading="eager" decoding="async"/>
          <figcaption className="bg-white px-4 py-3 text-xs font-medium text-slate-600">
            Illustrative campus imagery · Not documentation of a specific degree facility
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
            {program.name} is among the academic fields described by the {college.name}.
            {explainer ? ' '+explainer.learn : ' Its focus includes '+program.focus.toLowerCase()+'.'}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            To plan a suitable academic pathway, prospective students should verify official course
            requirements, degree availability, the entry process, and the academic calendar with HIAU.
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
        <section aria-labelledby="degree-world">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#956a32]">Society, technology and work</p>
          <h2 id="degree-world" className="mt-2 text-2xl font-bold tracking-tight text-[#35103b]">Relevance in today's world</h2>
          <p className="mt-4 text-base leading-7 text-slate-700">{explainer?.today ?? 'The importance of this field continues to evolve alongside technology, community needs and professional practice.'}</p>
        </section>
        <section aria-labelledby="degree-careers">
          <h2 id="degree-careers" className="text-2xl font-bold tracking-tight text-[#35103b]">Possible professional directions</h2>
          <p className="mt-4 text-base leading-7 text-slate-700">{explainer?.careers ?? 'Graduates may explore opportunities in their field or pursue further study, depending on professional qualifications and applicable regulations.'}</p>
          <p className="mt-3 text-xs leading-6 text-slate-600">Career paths are illustrative, not employment guarantees. Regulated professions may require additional training, certification or licensing.</p>
        </section>
        {released&&<section aria-labelledby="degree-curriculum" className="rounded-xl border border-[#dbc9de] bg-[#faf8fb] p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#956a32]">University-published academic curriculum</p>
          <h2 id="degree-curriculum" className="mt-2 text-2xl font-bold tracking-tight text-[#35103b]">Program courses and requirements</h2>
          <p className="mt-3 text-sm text-slate-700">Effective academic year {released.effectiveYear} · Publication version {released.version} · {released.requiredCredits} total credits</p>
          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {Object.entries(released.credits).map(([category,credits])=><div key={category} className="rounded-lg border border-[#e7dce8] bg-white p-3">
              <dt className="text-xs capitalize text-slate-600">{category}</dt><dd className="mt-1 text-lg font-bold text-[#35103b]">{credits}</dd>
            </div>)}
          </dl>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead><tr className="border-b border-[#d9cadc] text-[#35103b]">
                <th scope="col" className="p-2">Year / Semester</th><th scope="col" className="p-2">Course</th>
                <th scope="col" className="p-2">Category</th><th scope="col" className="p-2">Credits</th>
              </tr></thead>
              <tbody>{released.courses.map((course,index)=><tr key={course.code+'-'+index} className="border-b border-[#e7dce8]">
                <td className="p-2">Year {course.year}, semester {course.semester}</td>
                <td className="p-2"><span className="font-semibold text-[#35103b]">{course.code}</span> — {course.title}
                  {course.prerequisites&&<span className="block text-xs text-slate-600">Prerequisites: {course.prerequisites}</span>}
                </td><td className="p-2 capitalize">{course.category}</td><td className="p-2">{course.credits}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>}
        {!released&&!releaseLoading&&<p className="rounded-lg border border-[#e7dce8] bg-[#faf8fb] p-4 text-sm text-slate-600">
          A detailed, university-published course sequence is not yet available for this degree.
          Contact Admissions for confirmed academic requirements.
        </p>}
        <section aria-labelledby="degree-video">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#956a32]">Learn about this field</p>
          <h2 id="degree-video" className="mt-2 text-2xl font-bold tracking-tight text-[#35103b]">Why this degree matters today</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Watch the explainer currently published for this degree. The university may replace the original
            narration with an approved program-specific video through the website video library.
            Videos introduce the academic field and do not replace official program requirements.
            Playback starts muted when your browser permits autoplay; select Turn on narration to hear it.
          </p>
          <div className="mt-5">
            <PublicDegreeVideo key={route} route={route} source={degreeVideoSource} title={program.name}/>
          </div>
          <p className="mt-2 text-xs text-slate-600">Degree explainer · University-managed video · Program content and academic requirements are subject to official verification.</p>
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
