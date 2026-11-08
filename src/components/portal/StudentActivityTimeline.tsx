import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  FileCheck,
  Award,
  BookOpen,
  Wrench,
  Download,
  AlertCircle,
  Filter,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

export type ActivityType = 'submission' | 'grade' | 'library' | 'facility';

export interface StudentActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  courseCode?: string;
  description: string;
  timestamp: string; // ISO or relative
  relativeTime: string;
  statusText: string;
  statusColor: string;
  details?: string;
  actorName: string;
  actorRole: string;
  score?: string;
  grade?: string;
}

const INITIAL_STUDENT_ACTIVITIES: StudentActivityItem[] = [
  {
    id: 'act-1',
    type: 'submission',
    title: 'Assignment 2: AVL Tree Balance Algorithm & Soil Sensor Telemetry',
    courseCode: 'CSC 301',
    description: 'Submitted Java source code bundle (AgroSensorNode.java) and analysis report electronically via E-Learning Studio.',
    timestamp: '2026-11-02T12:15:00Z',
    relativeTime: '2 hours ago',
    statusText: 'Received • Pending Evaluation',
    statusColor: 'bg-amber-100 text-amber-900 border-amber-300',
    actorName: 'Sando Fahnbulleh',
    actorRole: 'Student',
    details: 'File: csc301-assignment2-fahnbulleh.zip (42 KB)',
  },
  {
    id: 'act-2',
    type: 'grade',
    title: 'Continuous Assessment 1: Algorithm Analysis & Asymptotic Bounds',
    courseCode: 'CSC 301',
    description: 'Formal continuous assessment marks posted to NCHE Master Gradebook by Dr. Moses S. Doe.',
    timestamp: '2026-11-01T15:30:00Z',
    relativeTime: 'Yesterday, 3:30 PM',
    statusText: 'Grade Published',
    statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    actorName: 'Dr. Moses S. Doe',
    actorRole: 'Senior Lecturer',
    score: '92 / 100',
    grade: 'A (4.0 QP)',
  },
  {
    id: 'act-3',
    type: 'library',
    title: 'Downloaded Undergraduate Student Handbook (2026/2027 Official Edition)',
    courseCode: 'INST-DOC',
    description: 'Cached official student conduct regulations and graduation requirement handbook for offline mobile access.',
    timestamp: '2026-11-01T11:20:00Z',
    relativeTime: 'Yesterday, 11:20 AM',
    statusText: 'Offline Cache Synced',
    statusColor: 'bg-purple-100 text-[#4A1249] border-purple-300',
    actorName: 'Sando Fahnbulleh',
    actorRole: 'Student',
    details: 'Format: Markdown / PDF (312 KB)',
  },
  {
    id: 'act-4',
    type: 'grade',
    title: 'Quiz 2: Propositional Logic & Boolean Circuit Satisfiability',
    courseCode: 'MAT 201',
    description: 'Mid-term quiz evaluation published by College of Engineering & Technology.',
    timestamp: '2026-10-31T14:10:00Z',
    relativeTime: 'Oct 31, 2026',
    statusText: 'Grade Published',
    statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    actorName: 'Prof. Joseph Flomo',
    actorRole: 'Dean / Lecturer',
    score: '88 / 100',
    grade: 'B+ (3.5 QP)',
  },
  {
    id: 'act-5',
    type: 'facility',
    title: 'Work Order #HIAU-FAC-2026-101: Laptop Lab Starlink Terminal Servicing',
    courseCode: 'FACILITY',
    description: 'Physical Plant dispatched network technician for Starlink UPS battery voltage calibration in the Laptop Lab.',
    timestamp: '2026-10-30T09:45:00Z',
    relativeTime: 'Oct 30, 2026',
    statusText: 'Dispatched to Crew',
    statusColor: 'bg-blue-100 text-blue-900 border-blue-300',
    actorName: 'Physical Plant Dispatcher',
    actorRole: 'Facilities Staff',
    details: 'Target SLA: 4 Hours (Urgent Priority)',
  },
  {
    id: 'act-6',
    type: 'submission',
    title: 'Problem Set 3: Discrete Mathematical Proofs',
    courseCode: 'MAT 201',
    description: 'Uploaded handwritten mathematical proofs and circuit diagrams for proof induction assessment.',
    timestamp: '2026-10-29T16:00:00Z',
    relativeTime: 'Oct 29, 2026',
    statusText: 'Evaluated • Verified',
    statusColor: 'bg-slate-100 text-slate-800 border-slate-300',
    actorName: 'Sando Fahnbulleh',
    actorRole: 'Student',
    details: 'Submitted on-time (2 days before deadline)',
  },
  {
    id: 'act-7',
    type: 'grade',
    title: 'Lab Practical 1: Object-Oriented Polymorphism in Java',
    courseCode: 'CSC 201',
    description: 'Laboratory grading evaluation conducted on Laptop Lab Workstation 14.',
    timestamp: '2026-10-28T13:00:00Z',
    relativeTime: 'Oct 28, 2026',
    statusText: 'Grade Published',
    statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    actorName: 'Dr. Moses S. Doe',
    actorRole: 'Senior Lecturer',
    score: '95 / 100',
    grade: 'A (4.0 QP)',
  },
  {
    id: 'act-8',
    type: 'library',
    title: 'Checked Out: NCHE Policy Guideline on Baccalaureate 4.0 Grading',
    courseCode: 'NCHE-REG',
    description: 'Consulted statutory quality point formula and Dean\'s Honor List thresholds.',
    timestamp: '2026-10-27T10:15:00Z',
    relativeTime: 'Oct 27, 2026',
    statusText: 'Document Reader Opened',
    statusColor: 'bg-purple-100 text-[#4A1249] border-purple-300',
    actorName: 'Sando Fahnbulleh',
    actorRole: 'Student',
  },
];

export const StudentActivityTimeline: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | 'all'>('all');
  const [activities] = useState<StudentActivityItem[]>(INITIAL_STUDENT_ACTIVITIES);

  const filtered = activities.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.type === selectedFilter;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'submission':
        return <FileCheck className="w-4 h-4 text-amber-600" />;
      case 'grade':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'library':
        return <BookOpen className="w-4 h-4 text-[#4A1249]" />;
      case 'facility':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white border-2 border-purple-200 rounded-2xl p-5 sm:p-6 shadow-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#4A1249] text-[#C39A53] rounded-lg shadow-2xs">
            <Clock className="w-5 h-5 text-[#C39A53]" />
          </div>
          <div>
            <h3 className="font-collegiate font-bold text-base text-[#4A1249] uppercase tracking-wide">
              Recent Academic Activity & Submissions Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Audited log of electronic course submissions, published grades, and digital library checkouts
            </p>
          </div>
        </div>

        {/* Quick Activity Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
            3 Grades Published (Avg: 91.7%)
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
            2 Submissions Active
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mr-1">Filter Activity:</span>
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#4A1249] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
          }`}
        >
          All Activity ({activities.length})
        </button>
        <button
          onClick={() => setSelectedFilter('submission')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
            selectedFilter === 'submission'
              ? 'bg-[#4A1249] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Course Submissions</span>
        </button>
        <button
          onClick={() => setSelectedFilter('grade')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
            selectedFilter === 'grade'
              ? 'bg-[#4A1249] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Grade Postings</span>
        </button>
        <button
          onClick={() => setSelectedFilter('library')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
            selectedFilter === 'library'
              ? 'bg-[#4A1249] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Library Checkouts</span>
        </button>
        <button
          onClick={() => setSelectedFilter('facility')}
          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
            selectedFilter === 'facility'
              ? 'bg-[#4A1249] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Work Orders</span>
        </button>
      </div>

      {/* Vertical Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-200">
        {filtered.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline Circle Bullet */}
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white border-2 border-[#4A1249] group-hover:border-[#C39A53] flex items-center justify-center shadow-xs transition-colors">
              {getActivityIcon(item.type)}
            </div>

            {/* Timeline Card */}
            <div className="bg-slate-50/70 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl p-4 transition-all shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.courseCode && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#4A1249] text-[#C39A53]">
                      {item.courseCode}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${item.statusColor}`}>
                    {item.statusText}
                  </span>
                  {item.score && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                      {item.score} • {item.grade}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-medium text-slate-500 font-mono">
                  {item.relativeTime}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {item.title}
              </h4>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>
                  Recorded by: <strong className="text-slate-800">{item.actorName}</strong> ({item.actorRole})
                </span>
                {item.details && (
                  <span className="font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                    {item.details}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
