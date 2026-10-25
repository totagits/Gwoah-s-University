import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Printer,
  Info,
  DollarSign,
  AlertTriangle,
  FileText,
  Building,
} from 'lucide-react';
import { Course, CourseSection, StudentProfileData, StudentRegistrationItem, UserProfile } from '../../types';
import { api } from '../../services/api';

interface AcademicPlanningRegistrationProps {
  currentUser: UserProfile;
  onOpenPrintModal: (docType: 'registration_plan') => void;
}

export const AcademicPlanningRegistration: React.FC<AcademicPlanningRegistrationProps> = ({
  currentUser,
  onOpenPrintModal,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [registrations, setRegistrations] = useState<StudentRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Course Modal State
  const [selectedSectionToAdd, setSelectedSectionToAdd] = useState<CourseSection | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Drop Course Modal State
  const [selectedRegToDrop, setSelectedRegToDrop] = useState<StudentRegistrationItem | null>(null);
  const [dropReason, setDropReason] = useState('Academic workload adjustment');
  const [dropLoading, setDropLoading] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const studentId = currentUser.role === 'student' ? currentUser.id : 'u-student';

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRes, studentRes] = await Promise.all([
        api.getCoursesAndSections(),
        api.getStudent(studentId),
      ]);
      if (courseRes.courses) setCourses(courseRes.courses);
      if (courseRes.sections) setSections(courseRes.sections);
      if (studentRes.student) setStudent(studentRes.student);
      if (studentRes.registrations) setRegistrations(studentRes.registrations);
    } catch (err) {
      console.error('Failed to load academic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const activeRegistrations = registrations.filter((r) => r.status === 'registered');
  const totalRegisteredCredits = activeRegistrations.reduce((sum, r) => sum + r.credits, 0);

  // Handle Add Course Execution
  const handleConfirmAddCourse = async () => {
    if (!selectedSectionToAdd) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await api.registerCourse(studentId, selectedSectionToAdd.id);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setSelectedSectionToAdd(null);
        await loadData();
      } else {
        setAddError(res.error || 'Failed to add course');
      }
    } catch (err: any) {
      setAddError(err.message || 'Error executing registration');
    } finally {
      setAddLoading(false);
    }
  };

  // Handle Drop Course Execution
  const handleConfirmDropCourse = async () => {
    if (!selectedRegToDrop) return;
    setDropLoading(true);
    setDropError(null);
    try {
      const res = await api.dropCourse(studentId, selectedRegToDrop.id, dropReason);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `${res.message} (Financial Adjustment: $${Math.abs(res.refundAdjustmentUSD || 0)} refunded to Bursar account)`,
        });
        setSelectedRegToDrop(null);
        await loadData();
      } else {
        setDropError(res.error || 'Failed to drop course');
      }
    } catch (err: any) {
      setDropError(err.message || 'Error dropping course');
    } finally {
      setDropLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-amber-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        <span className="ml-3 text-sm text-slate-300">Loading semester academic planning catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Print Plan CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Semester Planning & Add/Drop Management
            </h2>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
              Semester I 2026/2027
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Student: <strong className="text-white">{student?.fullName}</strong> ({student?.studentNumber}) • Program: {student?.program}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPrintModal('registration_plan')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Registration Slip</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Credit Summary & Policy Notice Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Registered Credits</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {totalRegisteredCredits} <span className="text-xs font-normal text-slate-400">/ 21 Max Cap</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Full-time threshold: 12 Credits min</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Enrolled Courses</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {activeRegistrations.length} <span className="text-xs font-normal text-slate-400">Courses</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">All sections in Monrovia Main</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Add / Drop Policy Window</div>
          <div className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Week 2 (100% Refund)
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Drop without transcript notation</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Advisor Status</div>
          <div className="text-base font-bold text-white mt-1">
            Approved by Advisor
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{student?.advisorName}</div>
        </div>
      </div>

      {/* ACTIVE REGISTERED COURSES (CURRENT SEMESTER) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              Currently Registered Semester Courses
            </h3>
            <p className="text-xs text-slate-400">
              Active enrollments in student schedule for Semester I 2026/2027
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            {totalRegisteredCredits} Total Credits
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Course Title</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Schedule & Room</th>
                <th className="px-4 py-3">Lecturer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Add/Drop Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activeRegistrations.map((reg) => {
                const section = sections.find((s) => s.id === reg.sectionId);
                return (
                  <tr key={reg.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">
                      {reg.courseCode}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {reg.courseTitle}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">{reg.credits} Cr</td>
                    <td className="px-4 py-3">
                      <div>{section?.schedule || 'Mon/Wed 10:00 AM'}</div>
                      <div className="text-[10px] text-slate-500">{section?.room || 'Main Campus'}</div>
                    </td>
                    <td className="px-4 py-3">{section?.lecturerName || 'Assigned Faculty'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                        Registered
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedRegToDrop(reg)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Drop Course</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AVAILABLE SECTIONS IN COURSE CATALOG TO ADD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              Course Catalog & Available Class Sections
            </h3>
            <p className="text-xs text-slate-400">
              Select an open section to register. Prerequisites and maximum credit caps are validated before entry.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {sections.length} Sections Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((sec) => {
            const isAlreadyEnrolled = activeRegistrations.some((r) => r.courseCode === sec.courseCode);
            const courseMeta = courses.find((c) => c.code === sec.courseCode);
            const isFull = sec.enrolled >= sec.capacity;

            return (
              <div
                key={sec.id}
                className="bg-slate-850 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-amber-400">{sec.courseCode}</span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                      {courseMeta?.credits || 3} Credits
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{sec.courseTitle}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {courseMeta?.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-xs space-y-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{sec.schedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{sec.room} • {sec.lecturerName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono">
                    Seats: <strong className={isFull ? 'text-rose-400' : 'text-emerald-400'}>{sec.enrolled}/{sec.capacity}</strong>
                  </span>

                  {isAlreadyEnrolled ? (
                    <span className="text-xs text-slate-500 italic">Already Enrolled</span>
                  ) : (
                    <button
                      disabled={isFull}
                      onClick={() => setSelectedSectionToAdd(sec)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isFull ? 'Section Full' : 'Add Course'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD COURSE CONFIRMATION MODAL */}
      {selectedSectionToAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-2 pb-3 border-b border-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Confirm Course Addition</span>
            </h3>

            {addError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-amber-400 font-mono font-bold">{selectedSectionToAdd.courseCode}</div>
                <div className="text-white font-bold text-sm">{selectedSectionToAdd.courseTitle}</div>
                <div className="text-slate-400">{selectedSectionToAdd.schedule} • {selectedSectionToAdd.room}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="text-slate-400">Current Semester Load</div>
                  <div className="font-bold text-white mt-0.5">{totalRegisteredCredits} Credits</div>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="text-slate-400">New Semester Load</div>
                  <div className="font-bold text-amber-400 mt-0.5">{totalRegisteredCredits + 3} Credits (Max 21)</div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  Adding this section satisfies prerequisite progression and updates your LMS roster instantly.
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSectionToAdd(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={addLoading}
                onClick={handleConfirmAddCourse}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {addLoading ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DROP COURSE CONFIRMATION & REASON MODAL (Detailed Add/Drop Process) */}
      {selectedRegToDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-rose-400 mb-2 pb-3 border-b border-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Confirm Course Drop & Add/Drop Policy Preview</span>
            </h3>

            {dropError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dropError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-amber-400 font-mono font-bold">{selectedRegToDrop.courseCode}</div>
                <div className="text-white font-bold text-sm">{selectedRegToDrop.courseTitle}</div>
                <div className="text-slate-400">Credits to drop: {selectedRegToDrop.credits} Credits</div>
              </div>

              {/* Policy Impact Breakdown */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Senate Add & Drop Policy Implications:
                </div>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li><strong>Semester Window:</strong> Week 2 (100% Tuition Fee Refund eligible)</li>
                  <li><strong>Financial Adjustment:</strong> -$180.00 USD credited back to student ledger</li>
                  <li><strong>Transcript Record:</strong> Dropped cleanly with no "W" withdrawal penalty</li>
                  <li><strong>Full-Time Status:</strong> Resulting load ({totalRegisteredCredits - selectedRegToDrop.credits} credits) remains ≥ 12 credit floor</li>
                </ul>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Reason for Drop (Recorded in Official Audit Log) *
                </label>
                <select
                  value={dropReason}
                  onChange={(e) => setDropReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Academic workload adjustment">Academic workload adjustment</option>
                  <option value="Timetable schedule conflict with work or laboratory">Timetable schedule conflict with laboratory</option>
                  <option value="Switching to alternate elective course">Switching to alternate elective</option>
                  <option value="Personal / medical accommodation">Personal / medical accommodation</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRegToDrop(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dropLoading}
                onClick={handleConfirmDropCourse}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {dropLoading ? 'Processing Drop...' : 'Confirm Drop & Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
