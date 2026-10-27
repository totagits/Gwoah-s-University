import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  DollarSign,
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Mail,
  Send,
  MessageSquare,
  Clock,
  Layers,
  Library,
  Landmark,
  Scale,
  Bookmark,
} from 'lucide-react';
import {
  StudentProfileData,
  StudentRegistrationItem,
  FinancialAccount,
  UserProfile,
  CourseMaterial,
  DirectMessage,
} from '../../types';
import { api } from '../../services/api';
import { calculateDegreeProgress } from '../../utils/academicRules';
import { SharedResourceLibrary } from './SharedResourceLibrary';
import { AcademicCalendarView } from './AcademicCalendarView';

interface StudentPortalViewProps {
  currentUser: UserProfile;
  onOpenPrintModal: (docType: 'transcript' | 'financial_statement') => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentUser,
  onOpenPrintModal,
}) => {
  const [activeTab, setActiveTab] = useState<'grades' | 'materials' | 'calendar' | 'library' | 'messages'>('grades');
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [registrations, setRegistrations] = useState<StudentRegistrationItem[]>([]);
  const [financialAccount, setFinancialAccount] = useState<FinancialAccount | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Material course filter
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Send message modal
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState('u-lecturer');
  const [messageCourse, setMessageCourse] = useState('CSC 301');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgNotification, setMsgNotification] = useState<string | null>(null);

  const studentId = currentUser.role === 'student' ? currentUser.id : 'u-student';

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [studentRes, matRes, msgRes] = await Promise.all([
        api.getStudent(studentId),
        api.getMaterials(),
        api.getMessages(studentId),
      ]);
      if (studentRes.student) setStudent(studentRes.student);
      if (studentRes.registrations) setRegistrations(studentRes.registrations);
      if (studentRes.financialAccount) setFinancialAccount(studentRes.financialAccount);
      if (matRes.materials) setMaterials(matRes.materials);
      if (msgRes.messages) setMessages(msgRes.messages);
    } catch (err) {
      console.error('Error fetching student portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMsg(true);
    try {
      const res = await api.sendMessage({
        senderId: studentId,
        senderName: student?.fullName || 'Student',
        senderRole: 'student',
        recipientId: messageRecipient,
        recipientName: messageRecipient === 'u-lecturer' ? 'Dr. Moses S. Doe' : 'Prof. Joseph Flomo',
        courseCode: messageCourse,
        subject: messageSubject,
        content: messageContent,
      });

      if (res.success && res.message) {
        setMessages((prev) => [res.message, ...prev]);
        setIsMessageModalOpen(false);
        setMessageSubject('');
        setMessageContent('');
        setMsgNotification('Message successfully sent to professor.');
        setTimeout(() => setMsgNotification(null), 4000);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-amber-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        <span className="ml-3 text-sm text-slate-300">Loading student master portal...</span>
      </div>
    );
  }

  if(!student)return <div className="campus-panel">Your academic record has not been linked yet. Please contact the registrar.</div>;
  const degreeProgress = calculateDegreeProgress(
    student.totalCreditsEarned,
    student.targetDegreeCredits
  );

  const filteredMaterials = materials.filter((m) => {
    if (selectedCourseFilter === 'all') return true;
    return m.courseCode.toLowerCase() === selectedCourseFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {student.fullName}
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded font-mono">
                  {student.studentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {student.program} • {student.faculty}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                <span>Campus: <strong className="text-slate-200">{student.campus}</strong></span>
                <span>•</span>
                <span>Academic Standing: <strong className="text-emerald-400 font-bold">{student.academicStanding}</strong></span>
                <span>•</span>
                <span>Advisor: <strong className="text-amber-400">{student.advisorName}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenPrintModal('transcript')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Verified Transcript</span>
            </button>
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Message Professor</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Cumulative GPA</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{student.cgpa}</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">{student.academicStanding}</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Credits Completed</div>
            <div className="text-2xl font-black text-white mt-0.5">
              {student.totalCreditsEarned} <span className="text-xs font-normal text-slate-400">/ {student.targetDegreeCredits}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{degreeProgress}% Degree Completed</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Financial Standing</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">Cleared</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Balance: $0.00 USD</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Class Attendance</div>
            <div className="text-2xl font-black text-blue-400 mt-0.5">94.2%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Above 80% threshold</div>
          </div>
        </div>
      </div>

      {msgNotification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msgNotification}</span>
          </div>
          <button onClick={() => setMsgNotification(null)} className="font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs: Grades, Syllabi & Notes, Messages */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'grades'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Grades & Academic Record</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'materials'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Syllabi & Lecture Notes ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'library'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>Shared Resource Library</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded font-semibold border border-amber-400/30">
            NCHE & Handbooks
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Academic Calendar & Exam Sync</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-rose-400/20 text-rose-300 rounded font-semibold border border-rose-400/30">
            Export .ICS
          </span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages & Professor Communication ({messages.length})</span>
        </button>
      </div>

      {/* 1. GRADES TAB */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          {/* Degree Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>NCHE Baccalaureate Degree Audit Progress (B.Sc. Computer Science)</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">{degreeProgress}% Completed</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${degreeProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>68 Credits Earned (General Education + Core Major)</span>
              <span>60 Credits Remaining for 2028 Convocation</span>
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Semester Course Gradebook & Assessed Quality Points
                </h3>
                <p className="text-xs text-slate-400">
                  Senate exam board verified • GPA calculated using official Liberian 4.0 quality point standard
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                Dean's List Honoree
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Course Code</th>
                    <th className="px-4 py-3">Course Name</th>
                    <th className="px-4 py-3">Credits</th>
                    <th className="px-4 py-3">Score / 100</th>
                    <th className="px-4 py-3">Letter Grade</th>
                    <th className="px-4 py-3">Quality Points</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">
                        {reg.courseCode}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {reg.courseTitle}
                      </td>
                      <td className="px-4 py-3 font-mono">{reg.credits} Cr</td>
                      <td className="px-4 py-3 font-mono text-slate-200">
                        {reg.score ? `${reg.score} / 100` : 'In Progress'}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">
                        {reg.grade || 'IP'}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {reg.grade === 'A'
                          ? (4.0 * reg.credits).toFixed(1)
                          : reg.grade === 'B+'
                          ? (3.5 * reg.credits).toFixed(1)
                          : reg.grade === 'B'
                          ? (3.0 * reg.credits).toFixed(1)
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                          {reg.status === 'registered' ? 'Active / Passed' : reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. COURSE SYLLABI & LECTURE NOTES TAB */}
      {activeTab === 'materials' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Course Syllabi & Lecture Materials</span>
              </h3>
              <p className="text-xs text-slate-400">
                Downloadable lecture notes, syllabi, and low-bandwidth study guides authored by course faculty.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Course:</span>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-bold"
              >
                <option value="all">All Enrolled Courses</option>
                <option value="CSC 301">CSC 301 - Data Structures</option>
                <option value="CSC 201">CSC 201 - OOP Java</option>
                <option value="MAT 201">MAT 201 - Discrete Math</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {mat.courseCode}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {mat.type.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {mat.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                    {mat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div>
                    <span>Author: <strong className="text-slate-200">{mat.facultyAuthor}</strong></span>
                    <span className="block font-mono text-[10px] text-slate-500 mt-0.5">
                      {mat.fileSizeKB} KB • Compressed for Low-Bandwidth
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const sampleContent = `# ${mat.title}\nCourse: ${mat.courseCode}\nAuthor: ${mat.facultyAuthor}\nType: ${mat.type}\nWeek: ${mat.weekNumber}\n\n${mat.description}\n\nGwoah's University Academic Intranet Repository`;
                      const fileName = `${mat.courseCode}_${mat.type}_Wk${mat.weekNumber}.md`;
                      const blob = new Blob([sampleContent], { type: 'text/markdown;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = fileName;
                      link.click();
                      setMsgNotification(`Downloaded "${mat.title}" for offline study.`);
                      setTimeout(() => setMsgNotification(null), 4000);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick link banner to Shared Resource Library */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-850 to-cyan-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                <Library className="w-5 h-5" />
              </span>
              <div>
                <strong className="text-white text-sm">Looking for official NCHE guidelines or institutional student handbooks?</strong>
                <p className="text-slate-400 text-xs mt-0.5">Access statutory accreditation standards, official 4.0 grading regulations, and the 2026/2027 Student Handbook.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-md transition-colors"
            >
              Open Shared Resource Library →
            </button>
          </div>
        </div>
      )}

      {/* 3. SHARED RESOURCE LIBRARY TAB */}
      {activeTab === 'library' && (
        <SharedResourceLibrary
          onNavigateToCourse={(c) => {
            setSelectedCourseFilter(c);
            setActiveTab('materials');
          }}
        />
      )}

      {/* 4. ACADEMIC CALENDAR & EXAM SCHEDULE SYNC TAB */}
      {activeTab === 'calendar' && (
        <AcademicCalendarView currentUser={currentUser} />
      )}

      {/* 5. MESSAGES & PROFESSOR COMMUNICATION TAB */}
      {activeTab === 'messages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <span>Professor & Advisor Messages</span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct academic inquiries and office hours dialogue with course professors.
              </p>
            </div>
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </div>

          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-white">{msg.subject}</span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      From: <strong className="text-amber-400">{msg.senderName}</strong> • To: <strong className="text-slate-200">{msg.recipientName}</strong> • Course: <strong className="text-slate-300">{msg.courseCode}</strong>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPOSE MESSAGE TO PROFESSOR MODAL */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-400" />
              <span>Message Course Professor</span>
            </h3>

            <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Professor</label>
                <select
                  value={messageRecipient}
                  onChange={(e) => setMessageRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="u-lecturer">Dr. Moses S. Doe (CSC 301 / CSC 201)</option>
                  <option value="u-dean">Prof. Joseph Flomo (Dean / MAT 201)</option>
                  <option value="u-registrar">Mrs. Patricia Tweh (Chief Registrar)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Course Code</label>
                <select
                  value={messageCourse}
                  onChange={(e) => setMessageCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="CSC 301">CSC 301 - Data Structures</option>
                  <option value="CSC 201">CSC 201 - OOP Java</option>
                  <option value="MAT 201">MAT 201 - Discrete Math</option>
                  <option value="ENG 101">ENG 101 - Academic Writing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Question on Assignment 2 or Office Hours"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Inquiry / Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="State your question or accommodation request clearly..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl disabled:opacity-50"
                >
                  {sendingMsg ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
