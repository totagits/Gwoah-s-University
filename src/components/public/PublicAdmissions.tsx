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
    mathGrade: 'B2',
    englishGrade: 'B3',
    scienceGrade: 'B3',
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

        {/* Scholarships & Financial Aid Callout */}
        <div className="bg-white border-2 border-[#C39A53]/70 rounded-xl p-6 sm:p-8 shadow-sm mb-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C39A53]">
              <Award className="w-4 h-4 text-[#C39A53]" />
              <span>HIAU Scholarship Committee</span>
            </div>
            <h3 className="text-2xl font-collegiate font-black text-[#4A1249] uppercase tracking-tight">
              NEED-BASED & MERIT-BASED FINANCIAL SCHOLARSHIPS
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              In harmony with our founding mandate that *"no one lives or dies without access to quality education,"* HIAU awards partial and full tuition scholarships to academically dedicated scholars facing economic hardships across Liberia. Applicants indicate financial aid interest upon submission.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="bg-[#FAF4E8] text-[#A17A32] px-3 py-1 rounded border border-[#C39A53]/30 font-semibold">Merit Scholarships (GPA &gt; 3.5)</span>
              <span className="bg-[#FAF4E8] text-[#A17A32] px-3 py-1 rounded border border-[#C39A53]/30 font-semibold">Need-Based Financial Assistance</span>
              <span className="bg-[#FAF4E8] text-[#A17A32] px-3 py-1 rounded border border-[#C39A53]/30 font-semibold">Scholarship Committee Interviews</span>
            </div>
          </div>

          <div className="md:col-span-4 bg-[#FAF4FB] border border-purple-200 rounded-lg p-5 text-center space-y-2">
            <DollarSign className="w-8 h-8 text-[#4A1249] mx-auto" />
            <div className="text-xs uppercase font-bold text-[#4A1249]">Placement Assessment Fee</div>
            <div className="text-2xl font-collegiate font-black text-[#C39A53]">$10 USD</div>
            <div className="text-[11px] text-slate-500">
              Payable via Lonestar MTN Mobile Money, Orange Money, or EcoBank direct slip
            </div>
          </div>
        </div>

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
                Applications for Semester I (2026/2027) are now actively under review. Apply today for BLEST degree programs and TVET certificate tracks.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenModal}
            className="px-6 py-3.5 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-collegiate font-black text-xs uppercase tracking-wider rounded-sm shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#2A082C]" />
            <span>Open Online Application ($10 Fee)</span>
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
                  The Admissions Committee will review your academic profile and reach out via email ({formData.email}) and phone ({formData.phone}) to schedule your $10 entrance assessment.
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
                    I wish to be considered for <strong>HIAU Need-Based or Merit Financial Aid</strong> through the Scholarship Committee.
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
                        <span>Submit Application ($10 Assessment Fee)</span>
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
