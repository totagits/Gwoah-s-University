import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Upload,
  Calendar,
  Send,
  Loader2,
  X,
  CreditCard,
  Phone,
} from 'lucide-react';
import { api } from '../../services/api';

interface PublicAdmissionsProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

export const PublicAdmissions: React.FC<PublicAdmissionsProps> = ({
  isModalOpen,
  onCloseModal,
  onOpenModal,
}) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    programDesired: 'B.Sc. in Computer Science',
    faculty: 'College of Engineering & Technology',
    wassceIndex: '',
    mathGrade: 'B2',
    englishGrade: 'B3',
    scienceGrade: 'B3',
    county: 'Montserrado',
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
          { subject: 'Elective Science / Business', grade: formData.scienceGrade },
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
    <section id="admissions" className="py-16 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Enrolment & Intake
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
            Admissions for Academic Year 2026/2027
          </h2>
          <p className="text-slate-400 mt-2 text-base">
            Transparent, merit-based, and non-discriminatory admission pathways for undergraduate and professional study.
          </p>
        </div>

        {/* Admissions Steps & Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">WASSCE Academic Eligibility</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
              Direct undergraduate applicants must present a certified West African Senior School Certificate Examination (WASSCE) scratch card with at least five (5) credits, including English Language and Mathematics.
            </p>
            <div className="text-xs bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80 text-amber-300 font-medium">
              WAEC Verification online batching processed through our Registry ERP.
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Online Application & Review</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
              Complete the digital application form, upload national identification / passport, and submit the $25 USD application fee via Lonestar MTN Mobile Money, Orange Money, or EcoBank direct slip.
            </p>
            <div className="text-xs bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80 text-blue-300 font-medium">
              Review committee evaluates applications weekly on a rolling basis.
            </div>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Offer, Orientation & Matriculation</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
              Upon admission confirmation, applicants receive an official admission letter and student ID number, enabling access to the student portal for semester course registration and bursar clearance.
            </p>
            <div className="text-xs bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80 text-emerald-300 font-medium">
              Special accommodations available for applicants with disabilities under DEI policy.
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-2xl p-8 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="text-2xl font-black tracking-tight">
              Ready to Join the Gwoah's University Community?
            </h4>
            <p className="text-slate-900 font-medium text-sm mt-1 max-w-xl">
              Applications for Semester I (Fall 2026) are now actively under review. Submit your credentials today.
            </p>
          </div>
          <button
            onClick={onOpenModal}
            className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            <span>Open Online Application</span>
          </button>
        </div>
      </div>

      {/* ONLINE APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8 text-slate-100 animate-in fade-in zoom-in-95">
            <button
              onClick={onCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
              aria-label="Close application dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Undergraduate Online Application</h3>
                <p className="text-xs text-slate-400">Semester I 2026/2027 • Gwoah's University Admissions Portal</p>
              </div>
            </div>

            {submissionSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-white">Application Received!</h4>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Your application has been registered in our Admissions Registry under Application Number:
                </p>
                <div className="bg-slate-800 border border-amber-500/40 rounded-xl py-3 px-6 text-xl font-mono font-bold text-amber-400 inline-block">
                  {submissionSuccess}
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  The Admissions Committee will review your WASSCE profile and contact you via email ({formData.email}) and phone ({formData.phone}).
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmissionSuccess(null);
                      onCloseModal();
                    }}
                    className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-600"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submissionError && (
                  <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Applicant Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Martha K. Weah"
                      value={formData.applicantName}
                      onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="martha.weah@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number (Liberia) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+231 770 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      County of Residence
                    </label>
                    <select
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {['Montserrado', 'Nimba', 'Bong', 'Grand Bassa', 'Margibi', 'Lofa', 'Maryland', 'Grand Cape Mount', 'Sinoe', 'Bomi', 'Gbarpolu', 'Grand Gedeh', 'River Gee', 'Rivercess', 'Grand Kru'].map((c) => (
                        <option key={c} value={c}>{c} County</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Desired Degree Program *
                    </label>
                    <select
                      value={formData.programDesired}
                      onChange={(e) => {
                        const prog = e.target.value;
                        let fac = 'College of Engineering & Technology';
                        if (prog.includes('Nursing') || prog.includes('Health')) fac = 'College of Health & Allied Medical Sciences';
                        if (prog.includes('Accounting') || prog.includes('Finance')) fac = 'College of Business & Public Administration';
                        if (prog.includes('Agronomy') || prog.includes('Agribusiness')) fac = 'College of Agriculture & Environmental Studies';
                        if (prog.includes('Education')) fac = 'School of Education & Human Development';
                        setFormData({ ...formData, programDesired: prog, faculty: fac });
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="B.Sc. in Computer Science">B.Sc. in Computer Science</option>
                      <option value="B.Sc. in Electrical Engineering">B.Sc. in Electrical Engineering</option>
                      <option value="B.Sc. in Mining Engineering">B.Sc. in Mining Engineering</option>
                      <option value="B.Sc. in Nursing (BSN)">B.Sc. in Nursing (BSN)</option>
                      <option value="B.Sc. in Public Health">B.Sc. in Public Health</option>
                      <option value="B.B.A. in Accounting">B.B.A. in Accounting</option>
                      <option value="B.B.A. in Banking & Finance">B.B.A. in Banking & Finance</option>
                      <option value="B.Sc. in Agronomy">B.Sc. in Agronomy & Crop Science</option>
                      <option value="B.Ed. in Secondary Education">B.Ed. in Secondary STEM Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WASSCE Examination Index Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 0010948219"
                      value={formData.wassceIndex}
                      onChange={(e) => setFormData({ ...formData, wassceIndex: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Self-Reported WASSCE Core Grades
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Mathematics</span>
                      <select
                        value={formData.mathGrade}
                        onChange={(e) => setFormData({ ...formData, mathGrade: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">English Lang</span>
                      <select
                        value={formData.englishGrade}
                        onChange={(e) => setFormData({ ...formData, englishGrade: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Core Elective</span>
                      <select
                        value={formData.scienceGrade}
                        onChange={(e) => setFormData({ ...formData, scienceGrade: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                      >
                        {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting to Registry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application ($25 USD)</span>
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
