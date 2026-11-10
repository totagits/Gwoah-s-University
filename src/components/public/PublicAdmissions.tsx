import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  X,
  Award,
  BookOpen,
  DollarSign,
  Users,
} from 'lucide-react';
import { api } from '../../services/api';

interface PublicAdmissionsProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

const ADMISSION_REQUIREMENTS = [
  {
    step: '1',
    title: 'COMPLETED APPLICATION FORM',
    desc: 'Submit your personal details, educational history, chosen BLEST college or TVET vocational track, and contact coordinates via our admissions portal or registry.',
    badge: 'Step 1 • Initial Filing',
  },
  {
    step: '2',
    title: 'OFFICIAL TRANSCRIPTS & WASSCE / WAEC',
    desc: 'High school graduates must present certified transcripts and WASSCE/WAEC results (minimum 5 credits, including English Language and Mathematics). Transfer students submit previous tertiary transcripts.',
    badge: 'Step 2 • Academic Credentials',
  },
  {
    step: '3',
    title: 'PASSPORT PHOTOS & IDENTIFICATION',
    desc: 'Two (2) recent passport-sized color photographs, along with valid national identification (Liberian National ID card, passport, or birth certificate).',
    badge: 'Step 3 • Verification',
  },
  {
    step: '4',
    title: 'ENTRANCE & PLACEMENT EXAMINATION ($10 USD)',
    desc: 'Complete the HIAU Undergraduate Entrance & Placement Assessment in core English and Mathematics competence. Nominal placement exam fee starts at approximately $10 USD.',
    badge: 'Step 4 • Assessment',
  },
  {
    step: '5',
    title: 'STATEMENT OR INTERVIEW WITH COMMITTEE',
    desc: 'Submit a personal essay or attend an admissions interview highlighting ethical leadership goals, spiritual alignment, and career aspirations.',
    badge: 'Step 5 • Whole-Person Fit',
  },
];

export const PublicAdmissions: React.FC<PublicAdmissionsProps> = ({
  isModalOpen,
  onCloseModal,
  onOpenModal,
}) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    programDesired: 'B.S. in Information Technology (IT)',
    faculty: 'College of Science, Technology & Allied Health',
    wassceIndex: '',
    mathGrade: '',
    englishGrade: '',
    scienceGrade: '',
    county: 'Montserrado',
    applyingForScholarship: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        applicantName: formData.applicantName,
    applyingForScholarship: formData.applyingForScholarship,
        email: formData.email,
        phone: formData.phone,
        programDesired: formData.programDesired,
        faculty: formData.faculty,
        wassceIndex: formData.wassceIndex,
        wassceCoreSubjects: [
          { subject: 'Mathematics', grade: formData.mathGrade },
          { subject: 'English Language', grade: formData.englishGrade },
          { subject: 'Core Elective', grade: formData.scienceGrade },
        ],
      };

      const res = await api.submitApplication(payload);
      if (res.success) {
        setSubmissionSuccess(res.application.applicationNumber);
      } else {
        setSubmissionError(res.error || 'Failed to submit application. Please check your data.');
      }
    } catch (err: any) {
      setSubmissionError(err.message || 'Network error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="admissions" className="py-16 bg-[#FAF8FB] text-[#2E0F34] border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C39A53] bg-[#4A1249] px-3.5 py-1.5 rounded-full border border-[#C39A53]/30 shadow-xs">
            Enrolment & Admissions Standards
          </span>
          <h2 className="text-4xl sm:text-5xl font-collegiate font-black mt-3 tracking-tight text-[#4A1249]">
            ADMISSIONS FOR ACADEMIC YEAR 2026/2027
          </h2>
          <p className="text-slate-600 mt-2 text-base leading-relaxed">
            Transparent, merit-based, and non-discriminatory admission pathways for undergraduate degrees, vocational tracks, and whole-person education at Harvest Intercontinental American University.
          </p>
        </div>

        {/* 5 Official Admission Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {ADMISSION_REQUIREMENTS.map((req, idx) => (
            <div
              key={idx}
              className="bg-white border border-purple-200/80 border-t-4 border-t-[#4A1249] rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#4A1249] text-[#C39A53] flex items-center justify-center font-collegiate font-black text-lg mb-3">
                  {req.step}
                </div>
                <span className="text-[10px] font-mono font-bold text-[#C39A53] uppercase block mb-1">
                  {req.badge}
                </span>
                <h3 className="text-sm font-collegiate font-bold text-[#4A1249] mb-2 tracking-tight">
                  {req.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {req.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Public financial-aid information: no unpublished award promises or
            invented eligibility cutoffs. Decisions belong to authorized staff. */}
        <section id="financial-aid" aria-labelledby="hiau-financial-aid-title"
          className="mb-12 rounded-xl border border-[#E5DEE8] bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#946D2C]">Admissions and affordability</p>
          <h3 id="hiau-financial-aid-title" className="mt-2 text-2xl font-bold tracking-tight text-[#4A1249] sm:text-3xl">
            Financial Aid &amp; Scholarships
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
            Students may inquire about need-based assistance, merit consideration and other forms of educational support.
            Eligibility, funding availability, application dates and final awards must be confirmed by HIAU's authorized admissions and financial-aid staff.
          </p>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              {heading:'Merit consideration',description:'Ask about academic-achievement criteria, required records and selection procedures.'},
              {heading:'Need-based assistance',description:'Learn what financial-circumstance information may be required and how applications are assessed.'},
              {heading:'Other student support',description:'Inquire about sponsorships, installment arrangements and support programs where approved and available.'}
            ].map(item=>(
              <div key={item.heading} className="rounded-lg border border-[#E7E0EA] bg-[#FBFAFC] p-5">
                <h4 className="font-semibold text-[#4A1249]">{item.heading}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 border-t border-[#E7E0EA] pt-5">
            <h4 className="text-base font-semibold text-[#4A1249]">How to inquire</h4>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              Contact the university's admissions office at <a href="mailto:info@hiau.org.lr"
              className="font-semibold text-[#4A1249] underline underline-offset-2">info@hiau.org.lr</a> to request current policies,
              eligibility criteria, deadlines and approved application instructions. An inquiry does not establish an award or guarantee tuition assistance.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Online scholarship application tracking and award processing are not yet available through this public website.
              Never send banking details or sensitive financial documents by ordinary email unless the university provides an approved secure submission method.
            </p>
          </div>
        </section>

        {/* CTA Banner - HIAU Imperial Purple with Heritage Gold Accent */}
        <div className="bg-[#4A1249] text-white border-2 border-[#C39A53]/60 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src="/assets/aistudio/image_bfcc4a11.png"
              alt="Harvest Intercontinental American University Seal"
              className="w-16 h-16 object-contain hidden sm:block bg-white rounded-full p-1 shrink-0 border border-[#C39A53]"
            />
            <div>
              <h4 className="text-2xl sm:text-3xl font-collegiate font-bold tracking-tight text-white uppercase">
                START YOUR JOURNEY AT HARVEST INTERCONTINENTAL AMERICAN UNIVERSITY
              </h4>
              <p className="text-purple-100 text-sm mt-1 max-w-xl leading-relaxed">
                Submit your admissions information for review. Confirm admissions dates, entrance-assessment fees and payment instructions directly with the university before paying.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenModal}
            className="px-6 py-3.5 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-collegiate font-black text-xs uppercase tracking-wider rounded-sm shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#2A082C]" />
            <span>Open online application</span>
          </button>
        </div>
      </div>

      {/* ONLINE APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A051C]/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#4A1249] rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8 text-[#2E0F34] animate-in fade-in zoom-in-95">
            <button
              onClick={onCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#4A1249] p-2 rounded bg-slate-100 hover:bg-purple-100 cursor-pointer"
              aria-label="Close application dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 pb-4 border-b border-purple-100 mb-6">
              <img
                src="/assets/aistudio/image_bfcc4a11.png"
                alt="Harvest Intercontinental American University Seal"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="text-xl sm:text-2xl font-collegiate font-bold text-[#4A1249] uppercase tracking-tight">
                  HIAU FORMAL ADMISSIONS APPLICATION
                </h3>
                <p className="text-xs text-slate-500 font-medium">Semester I 2026/2027 • BLEST Colleges & TVET Career Tracks</p>
              </div>
            </div>

            {submissionSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-purple-50 text-[#4A1249] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-[#C39A53]" />
                </div>
                <h4 className="text-2xl font-collegiate font-bold text-[#4A1249] uppercase">APPLICATION SUBMITTED SUCCESSFULLY!</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your application has been registered in the HIAU Admissions Registry under Reference Number:
                </p>
                <div className="bg-[#4A1249] border-2 border-[#C39A53] rounded py-3 px-6 text-xl font-mono font-bold text-[#C39A53] inline-block">
                  {submissionSuccess}
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your application has been recorded for admissions review. No admission decision or payment has been made. Keep this reference number for follow-up at your registered email ({formData.email}).
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmissionSuccess(null);
                      onCloseModal();
                    }}
                    className="px-6 py-2.5 bg-[#C39A53] text-[#2A082C] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#D4B06F] cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submissionError && (
                  <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      Applicant Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Martha K. Weah"
                      value={formData.applicantName}
                      onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="martha.weah@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      Phone Number (Liberia) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+231 770 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      County of Residence
                    </label>
                    <select
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                    >
                      {['Montserrado', 'Nimba', 'Bong', 'Grand Bassa', 'Margibi', 'Lofa', 'Maryland', 'Grand Cape Mount', 'Sinoe', 'Bomi', 'Gbarpolu', 'Grand Gedeh', 'River Gee', 'Rivercess', 'Grand Kru'].map((c) => (
                        <option key={c} value={c}>{c} County</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      Desired BLEST Degree / TVET Program *
                    </label>
                    <select
                      value={formData.programDesired}
                      onChange={(e) => {
                        const prog = e.target.value;
                        let fac = 'College of Science, Technology & Allied Health';
                        if (prog.includes('Accounting') || prog.includes('Entrepreneurship')) fac = 'College of Business & Entrepreneurship';
                        if (prog.includes('Education')) fac = 'College of Education';
                        if (prog.includes('Theology') || prog.includes('Missions') || prog.includes('Christian')) fac = 'College of Theology & Ministry';
                        if (prog.includes('Liberal Arts') || prog.includes('Communications') || prog.includes('Social Sciences')) fac = 'College of Liberal Arts & Social Sciences';
                        if (prog.includes('TVET') || prog.includes('Cosmetology') || prog.includes('Catering') || prog.includes('Tailoring') || prog.includes('Carpentry')) fac = 'TVET Career Vocational Division';
                        setFormData({ ...formData, programDesired: prog, faculty: fac });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-[#2E0F34] focus:outline-none focus:border-[#4A1249]"
                    >
                      <optgroup label="S — Science, Technology & Allied Health">
                        <option value="B.S. in Information Technology (IT)">B.S. in Information Technology (IT)</option>
                        <option value="B.S. in Science and Technology">B.S. in Science and Technology</option>
                        <option value="B.S. in Nursing (BSN)">B.S. in Nursing (BSN)</option>
                        <option value="B.S. in Laboratory Science">B.S. in Laboratory Science</option>
                        <option value="B.S. in Environmental Science">B.S. in Environmental Science</option>
                        <option value="B.S. in Health Administration">B.S. in Health Administration</option>
                      </optgroup>
                      <optgroup label="B — Business & Entrepreneurship">
                        <option value="B.B.A. in Accounting">B.B.A. in Accounting</option>
                        <option value="B.B.A. in Entrepreneurship">B.B.A. in Entrepreneurship</option>
                      </optgroup>
                      <optgroup label="E — Education">
                        <option value="B.Ed. in Early Childhood Education">B.Ed. in Early Childhood Education</option>
                        <option value="B.Ed. in Elementary Education (Language Arts & Social Studies)">B.Ed. in Elementary Education (Language Arts)</option>
                        <option value="B.Ed. in Elementary Education (Math & Science)">B.Ed. in Elementary Education (Math & Science)</option>
                        <option value="B.Ed. in Secondary Education (Mathematics Focus)">B.Ed. in Secondary Education (Mathematics)</option>
                        <option value="B.Ed. in Secondary Education (English Focus)">B.Ed. in Secondary Education (English)</option>
                      </optgroup>
                      <optgroup label="L — Liberal Arts & Social Sciences">
                        <option value="B.A. in Liberal Arts & Humanities">B.A. in Liberal Arts & Humanities</option>
                        <option value="B.A. in Strategic Communications & Media">B.A. in Strategic Communications & Media</option>
                        <option value="B.S. in Social Sciences & General Studies">B.S. in Social Sciences & General Studies</option>
                      </optgroup>
                      <optgroup label="T — Theology & Ministry">
                        <option value="B.Th. in Christian Education">B.Th. in Christian Education</option>
                        <option value="B.Th. in Christian Counseling">B.Th. in Christian Counseling</option>
                        <option value="B.Th. in Missions & Global Evangelism">B.Th. in Missions & Global Evangelism</option>
                      </optgroup>
                      <optgroup label="TVET Vocational Certificates">
                        <option value="TVET Certificate in Cosmetology">TVET Certificate in Cosmetology</option>
                        <option value="TVET Certificate in Catering & Pastry Arts">TVET Certificate in Catering & Pastry Arts</option>
                        <option value="TVET Certificate in Tailoring & Garment Construction">TVET Certificate in Tailoring & Garments</option>
                        <option value="TVET Certificate in Carpentry & Architectural Woodworks">TVET Certificate in Carpentry</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                      WASSCE / WAEC Index Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 0010948219"
                      value={formData.wassceIndex}
                      onChange={(e) => setFormData({ ...formData, wassceIndex: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-[#2E0F34] focus:outline-none focus:border-[#4A1249] font-mono"
                    />
                  </div>
                </div>

                <div className="bg-[#FAF4FB] p-3.5 rounded border border-purple-100 space-y-2">
                  <div className="text-xs font-bold text-[#4A1249] uppercase tracking-wider">
                    Self-Reported WASSCE Core Grades
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-600 font-semibold block mb-1">Mathematics</span>
                      <select
                        value={formData.mathGrade}
                        onChange={(e) => setFormData({ ...formData, mathGrade: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-[#2E0F34]"
                      >
                        <option value="">Select grade</option>
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-600 font-semibold block mb-1">English Lang</span>
                      <select
                        value={formData.englishGrade}
                        onChange={(e) => setFormData({ ...formData, englishGrade: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-[#2E0F34]"
                      >
                        <option value="">Select grade</option>
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-600 font-semibold block mb-1">Core Elective</span>
                      <select
                        value={formData.scienceGrade}
                        onChange={(e) => setFormData({ ...formData, scienceGrade: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-[#2E0F34]"
                      >
                        <option value="">Select grade</option>
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Scholarship consideration checkbox */}
                <div className="p-3 bg-amber-50/70 border border-[#C39A53]/40 rounded flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="scholarshipCheck"
                    checked={formData.applyingForScholarship}
                    onChange={(e) => setFormData({ ...formData, applyingForScholarship: e.target.checked })}
                    className="w-4 h-4 text-[#4A1249] rounded border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="scholarshipCheck" className="text-xs text-slate-800 font-medium cursor-pointer">
                    I would like HIAU to contact me about <strong>financial-aid or scholarship consideration</strong>. This is an expression of interest, not a scholarship application or award.
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 shadow disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting to Registry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#2A082C]" />
                        <span>Submit application (no online charge)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
