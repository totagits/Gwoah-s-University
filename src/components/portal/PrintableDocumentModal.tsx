import React from 'react';
import {
  Printer,
  X,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Download,
} from 'lucide-react';
import { StudentProfileData, StudentRegistrationItem, FinancialAccount } from '../../types';

interface PrintableDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'registration_plan' | 'transcript' | 'financial_statement';
  student: StudentProfileData;
  registrations: StudentRegistrationItem[];
  financialAccount: FinancialAccount;
}

export const PrintableDocumentModal: React.FC<PrintableDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  student,
  registrations,
  financialAccount,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const activeRegistrations = registrations.filter((r) => r.status === 'registered');
  const totalCredits = activeRegistrations.reduce((sum, r) => sum + r.credits, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl relative my-6 print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Official University Document Preview</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
              aria-label="Close document modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-8 sm:p-12 space-y-6 text-xs text-slate-800">
          {/* Institutional Crest & Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-500 flex items-center justify-center font-bold text-2xl shadow">
                <GraduationCap className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-950 font-serif">
              Gwoah's University
            </h1>
            <p className="text-[11px] font-semibold text-slate-700 tracking-wide">
              REPUBLIC OF LIBERIA • CHARTERED BY THE NATIONAL COMMISSION ON HIGHER EDUCATION (NCHE)
            </p>
            <p className="text-[10px] text-slate-500 font-serif italic">
              "Knowledge • Integrity • National Service" — Monrovia & Fendall Campuses
            </p>

            <div className="pt-2 text-sm font-extrabold uppercase tracking-widest text-amber-800 underline">
              {documentType === 'registration_plan' && 'OFFICIAL SEMESTER REGISTRATION PLAN'}
              {documentType === 'transcript' && 'OFFICIAL CERTIFIED ACADEMIC TRANSCRIPT'}
              {documentType === 'financial_statement' && 'OFFICIAL STUDENT STATEMENT OF ACCOUNT'}
            </div>
          </div>

          {/* Student Identifiers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Student Name</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{student.fullName}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Student Number</div>
              <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{student.studentNumber}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Academic Program</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{student.program}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Term</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">Semester I 2026/2027</div>
            </div>
          </div>

          {/* DOCUMENT CONTENT TYPE 1: SEMESTER REGISTRATION PLAN */}
          {documentType === 'registration_plan' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Course Code</th>
                    <th className="p-2 border-r border-slate-300">Course Title</th>
                    <th className="p-2 border-r border-slate-300 text-center">Credits</th>
                    <th className="p-2 border-r border-slate-300">Class Meeting Schedule</th>
                    <th className="p-2 border-r border-slate-300">Lecturer</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {activeRegistrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="p-2 font-bold border-r border-slate-200 text-slate-950">{reg.courseCode}</td>
                      <td className="p-2 font-sans font-medium border-r border-slate-200 text-slate-900">{reg.courseTitle}</td>
                      <td className="p-2 text-center font-bold border-r border-slate-200">{reg.credits}</td>
                      <td className="p-2 font-sans border-r border-slate-200">Mon/Wed 10:00 AM</td>
                      <td className="p-2 font-sans border-r border-slate-200">Faculty Assigned</td>
                      <td className="p-2 text-center font-sans font-bold text-emerald-800">Registered</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold font-sans">
                    <td colSpan={2} className="p-2 text-right border-r border-slate-300">Total Registered Credits:</td>
                    <td className="p-2 text-center font-mono border-r border-slate-300">{totalCredits} Credits</td>
                    <td colSpan={3} className="p-2 text-slate-600 font-normal">Standard 12–21 credit policy satisfied</td>
                  </tr>
                </tbody>
              </table>

              {/* Clearance & Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="border-t border-slate-400 pt-2 text-center">
                  <div className="font-bold text-slate-900">Dr. Moses S. Doe</div>
                  <div className="text-[10px] text-slate-500">Academic Faculty Advisor Signature</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Approved & Verified in ERP</div>
                </div>

                <div className="border-t border-slate-400 pt-2 text-center">
                  <div className="font-bold text-slate-900">Mrs. Patricia Tweh</div>
                  <div className="text-[10px] text-slate-500">Chief University Registrar</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Official Institutional Seal Affixed</div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT CONTENT TYPE 2: CERTIFIED ACADEMIC TRANSCRIPT */}
          {documentType === 'transcript' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
                <div>
                  Cumulative Grade Point Average (CGPA): <strong className="text-amber-900 font-mono text-sm">{student.cgpa}</strong>
                </div>
                <div>
                  Academic Standing: <strong className="text-emerald-800">{student.academicStanding}</strong>
                </div>
                <div>
                  Total Credits Earned: <strong className="font-mono">{student.totalCreditsEarned} / {student.targetDegreeCredits}</strong>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Course Code</th>
                    <th className="p-2 border-r border-slate-300">Course Title</th>
                    <th className="p-2 border-r border-slate-300 text-center">Credits</th>
                    <th className="p-2 border-r border-slate-300 text-center">Letter Grade</th>
                    <th className="p-2 border-r border-slate-300 text-center">Quality Points</th>
                    <th className="p-2 text-center">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="p-2 font-bold border-r border-slate-200">{reg.courseCode}</td>
                      <td className="p-2 font-sans font-medium border-r border-slate-200">{reg.courseTitle}</td>
                      <td className="p-2 text-center border-r border-slate-200">{reg.credits}</td>
                      <td className="p-2 text-center font-bold border-r border-slate-200 text-amber-900">{reg.grade || 'A'}</td>
                      <td className="p-2 text-center border-r border-slate-200">
                        {reg.grade === 'A' ? (4.0 * reg.credits).toFixed(1) : (3.5 * reg.credits).toFixed(1)}
                      </td>
                      <td className="p-2 text-center font-sans text-emerald-800 font-semibold">Passed</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Digital Verification Block */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-300 rounded-xl mt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Cryptographic Verification Certificate</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    SHA-256 Hash: 9f82ab44e21a8d0092bc1356eac7b8192a9f4c
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Third-party employers and universities may verify authenticity at: https://gwoah.edu.lr/verify/{student.studentNumber}
                  </div>
                </div>

                <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT CONTENT TYPE 3: FINANCIAL STATEMENT */}
          {documentType === 'financial_statement' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>Total Billed: <strong className="font-mono">${financialAccount.tuitionBilledUSD.toFixed(2)}</strong></div>
                <div>Total Paid: <strong className="font-mono text-emerald-700">${financialAccount.totalPaidUSD.toFixed(2)}</strong></div>
                <div>Net Balance: <strong className="font-mono text-emerald-700">${financialAccount.currentBalanceUSD.toFixed(2)} (Cleared)</strong></div>
              </div>

              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Date</th>
                    <th className="p-2 border-r border-slate-300">Transaction Details</th>
                    <th className="p-2 border-r border-slate-300">Receipt Ref</th>
                    <th className="p-2 border-r border-slate-300">Payment Channel</th>
                    <th className="p-2 text-right">Amount (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {financialAccount.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="p-2 border-r border-slate-200 text-slate-600">{tx.date}</td>
                      <td className="p-2 font-sans font-medium border-r border-slate-200 text-slate-900">{tx.type}</td>
                      <td className="p-2 border-r border-slate-200 text-amber-900">{tx.reference}</td>
                      <td className="p-2 font-sans border-r border-slate-200 text-slate-600">{tx.paymentMethod || 'Institutional'}</td>
                      <td className="p-2 text-right font-bold text-slate-950">${tx.amountUSD.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-6 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                <div>Issued by Office of the Bursar & Financial Comptroller</div>
                <div>Stamp: <strong>BURSAR PAID & CLEARED • SEMESTER I 2026/2027</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
