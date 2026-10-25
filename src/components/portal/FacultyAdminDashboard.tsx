import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Mail,
  Send,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Shield,
  FileText,
  UserPlus,
} from 'lucide-react';
import { UserProfile, CourseSection, Course, DirectMessage, UniversityTask } from '../../types';
import { api } from '../../services/api';
import { scoreToLetterGrade } from '../../utils/academicRules';

interface FacultyAdminDashboardProps {
  currentUser: UserProfile;
  onOpenTaskModal?: () => void;
}

export const FacultyAdminDashboard: React.FC<FacultyAdminDashboardProps> = ({
  currentUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'grades' | 'tasks' | 'messages' | 'users' | 'catalog'>('grades');

  // Faculty Grade Updates state
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [roster, setRoster] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [editingScore, setEditingScore] = useState<{ registrationId: string; score: number } | null>(null);
  const [gradeUpdateSuccess, setGradeUpdateSuccess] = useState<string | null>(null);

  // Messaging state
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [msgRecipient, setMsgRecipient] = useState('u-student');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Admin User Management state
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'lecturer',
    title: 'Assistant Professor',
    department: 'Computer Science',
  });

  // Admin Catalog Management state
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseModalOpen, setNewCourseModalOpen] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    code: '',
    title: '',
    credits: 3,
    department: 'Computer Science',
    faculty: 'College of Engineering & Technology',
    feePerCreditUSD: 45,
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Load initial sections, courses, users, and messages
  useEffect(() => {
    const init = async () => {
      try {
        const [courseRes, userRes, msgRes] = await Promise.all([
          api.getCoursesAndSections(),
          api.getUsers(),
          api.getMessages(currentUser.id),
        ]);
        if (courseRes.sections && courseRes.sections.length > 0) {
          setSections(courseRes.sections);
          setSelectedSectionId(courseRes.sections[0].id);
        }
        if (courseRes.courses) setCourses(courseRes.courses);
        if (userRes.users) setAllUsers(userRes.users);
        if (msgRes.messages) setMessages(msgRes.messages);
      } catch (err) {
        console.error('Failed to initialize faculty/admin dashboard:', err);
      }
    };
    init();
  }, [currentUser.id]);

  // Load roster when selectedSectionId changes
  useEffect(() => {
    if (!selectedSectionId) return;
    const fetchRoster = async () => {
      setLoadingRoster(true);
      try {
        const res = await api.getFacultyRoster(selectedSectionId);
        if (res.roster) {
          setRoster(res.roster);
        }
      } catch (err) {
        console.error('Failed to fetch section roster:', err);
      } finally {
        setLoadingRoster(false);
      }
    };
    fetchRoster();
  }, [selectedSectionId]);

  // Handle grade submission
  const handleSaveGrade = async (registrationId: string, score: number) => {
    try {
      const calculatedGrade = scoreToLetterGrade(score);
      const res = await api.updateFacultyGrade({
        registrationId,
        score,
        letterGrade: calculatedGrade,
        facultyName: currentUser.name,
      });
      if (res.success) {
        setRoster((prev) =>
          prev.map((r) =>
            r.registrationId === registrationId ? { ...r, score, grade: calculatedGrade } : r
          )
        );
        setEditingScore(null);
        setGradeUpdateSuccess(res.message);
        setTimeout(() => setGradeUpdateSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Failed to save grade:', err);
    }
  };

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMsg(true);
    try {
      const targetUser = allUsers.find((u) => u.id === msgRecipient);
      const res = await api.sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        recipientId: msgRecipient,
        recipientName: targetUser?.name || 'Student / Faculty',
        courseCode: 'Academic Office',
        subject: msgSubject,
        content: msgContent,
      });
      if (res.success && res.message) {
        setMessages((prev) => [res.message, ...prev]);
        setComposeModalOpen(false);
        setMsgSubject('');
        setMsgContent('');
        setNotification('Message delivered successfully.');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Handle creating user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAdminUser(newUserData);
      if (res.success && res.user) {
        setAllUsers((prev) => [...prev, res.user]);
        setNewUserModalOpen(false);
        setNotification(`Created new user account for ${res.user.name}`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  // Handle creating course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCourse(newCourseData);
      if (res.success && res.course) {
        setCourses((prev) => [...prev, res.course]);
        setNewCourseModalOpen(false);
        setNotification(`Added course ${res.course.code} to university catalog`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };

  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'registrar' || currentUser.role === 'dean';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Faculty & Administration Management
            </h2>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
              {isAdmin ? 'Administrative Level Access' : 'Faculty Instructor Level'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gradebook submission, student communication, task allocation, user account governance, and course catalog scheduling.
          </p>
        </div>

        {/* Sub tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveSubTab('grades')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'grades' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Grade Roster
          </button>
          <button
            onClick={() => setActiveSubTab('messages')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'messages' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Communication ({messages.length})
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveSubTab('users')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeSubTab === 'users' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                User Accounts
              </button>
              <button
                onClick={() => setActiveSubTab('catalog')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeSubTab === 'catalog' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Course Catalog
              </button>
            </>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. FACULTY GRADE UPDATES & ROSTER */}
      {activeSubTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold">Select Class Section:</span>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.courseCode} ({sec.sectionCode}) - {sec.courseTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Instructor: <strong className="text-amber-400">{currentUser.name}</strong> • Term: Semester I 2026/2027
            </div>
          </div>

          {gradeUpdateSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{gradeUpdateSuccess}</span>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Class Gradebook & Continuous Assessment Roster
                </h3>
                <p className="text-xs text-slate-400">
                  Enter final examination or midterm scores. Scores are automatically translated to NCHE letter grades and quality points.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                {roster.length} Enrolled Scholars
              </span>
            </div>

            {loadingRoster ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading section roster...
              </div>
            ) : roster.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 italic">
                No students currently enrolled in this section.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Student ID</th>
                      <th className="px-4 py-3">Credits</th>
                      <th className="px-4 py-3">Attendance</th>
                      <th className="px-4 py-3">Current Score (%)</th>
                      <th className="px-4 py-3">Letter Grade</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {roster.map((item) => {
                      const isEditing = editingScore?.registrationId === item.registrationId;
                      return (
                        <tr key={item.registrationId} className="hover:bg-slate-850/60 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">
                            {item.studentName}
                          </td>
                          <td className="px-4 py-3 font-mono text-amber-400 font-bold">
                            {item.studentNumber}
                          </td>
                          <td className="px-4 py-3 font-mono">{item.credits} Cr</td>
                          <td className="px-4 py-3 font-mono text-emerald-400">{item.attendanceRate}%</td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editingScore.score}
                                onChange={(e) =>
                                  setEditingScore({ ...editingScore, score: Number(e.target.value) })
                                }
                                className="w-20 px-2 py-1 bg-slate-800 border border-amber-500 rounded text-xs text-white font-mono font-bold"
                              />
                            ) : (
                              <span className="font-mono font-bold text-white text-sm">
                                {item.score}%
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                              {isEditing ? scoreToLetterGrade(editingScore.score) : item.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleSaveGrade(item.registrationId, editingScore.score)}
                                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingScore(null)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingScore({
                                    registrationId: item.registrationId,
                                    score: item.score || 85,
                                  })
                                }
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Grade</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FACULTY-STUDENT COMMUNICATION */}
      {activeSubTab === 'messages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <span>Academic Communication & Messages</span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct messaging between faculty instructors, academic advisors, and students.
              </p>
            </div>
            <button
              onClick={() => setComposeModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Message</span>
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
                      From: <strong className="text-amber-400">{msg.senderName}</strong> ({msg.senderRole}) • To: <strong className="text-slate-200">{msg.recipientName}</strong>
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

            {messages.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500 italic">
                No message threads found. Click "Compose Message" to initiate academic communication.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ADMINISTRATOR USER ACCOUNT MANAGEMENT */}
      {activeSubTab === 'users' && isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Institutional User Account Directory</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage university personnel, role assignments, department affiliations, and authentication accounts.
              </p>
            </div>
            <button
              onClick={() => setNewUserModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Name & Title</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Staff / Student ID</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.title}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.department || 'General'}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{u.staffId || u.studentId || 'N/A'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ADMINISTRATOR COURSE CATALOG MANAGEMENT */}
      {activeSubTab === 'catalog' && isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>University Course Catalog & Curricula Setup</span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure approved university courses, credit weights, and NCHE faculty mappings.
              </p>
            </div>
            <button
              onClick={() => setNewCourseModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-sm">{course.code}</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-mono text-slate-200 border border-slate-700">
                    {course.credits} Credits (${course.feePerCreditUSD}/cr)
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{course.title}</h4>
                <p className="text-xs text-slate-400">{course.description}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>{course.department}</span>
                  <span className="text-emerald-400">Accredited</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPOSE MESSAGE MODAL */}
      {composeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              <span>Send Message</span>
            </h3>

            <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Recipient</label>
                <select
                  value={msgRecipient}
                  onChange={(e) => setMsgRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {allUsers.filter((u) => u.id !== currentUser.id).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Office Hours Inquiry / Assignment 2 Feedback"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your message here..."
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setComposeModalOpen(false)}
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

      {/* CREATE USER MODAL */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>Create New User Account</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Martha K. Johnson"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="m.johnson@gwoah.edu.lr"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="lecturer">Lecturer / Faculty</option>
                    <option value="dean">Dean of Faculty</option>
                    <option value="registrar">Registrar Officer</option>
                    <option value="bursar">Bursar / Cashier</option>
                    <option value="admissions_officer">Admissions Officer</option>
                    <option value="student">Student</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserData.department}
                    onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Title</label>
                <input
                  type="text"
                  placeholder="e.g., Associate Professor of Nursing"
                  value={newUserData.title}
                  onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {newCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Add Course to University Catalog</span>
            </h3>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CSC 401"
                    value={newCourseData.code}
                    onChange={(e) => setNewCourseData({ ...newCourseData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={newCourseData.credits}
                    onChange={(e) => setNewCourseData({ ...newCourseData, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Distributed Cloud Systems & Microservices"
                  value={newCourseData.title}
                  onChange={(e) => setNewCourseData({ ...newCourseData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newCourseData.department}
                    onChange={(e) => setNewCourseData({ ...newCourseData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tuition Rate ($/Credit)</label>
                  <input
                    type="number"
                    value={newCourseData.feePerCreditUSD}
                    onChange={(e) => setNewCourseData({ ...newCourseData, feePerCreditUSD: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewCourseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
