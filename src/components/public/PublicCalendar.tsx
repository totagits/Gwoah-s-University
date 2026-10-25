import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export const PublicCalendar: React.FC = () => {
  const semesters = [
    {
      name: 'Semester I (Fall 2026)',
      status: 'Current Active Term',
      isCurrent: true,
      events: [
        { date: 'Oct 01 - Oct 10, 2026', title: 'Regular Course Registration & Bursar Clearance', status: 'Completed', type: 'registration' },
        { date: 'Oct 12 - Oct 26, 2026', title: 'Official Add & Drop Period (100% Refund Window)', status: 'Active Now', type: 'add_drop' },
        { date: 'Nov 16 - Nov 21, 2026', title: 'Mid-Semester Examinations & Continuous Assessment', status: 'Upcoming', type: 'exam' },
        { date: 'Dec 18, 2026', title: 'Final Day for Late Course Withdrawal with "W" Grade', status: 'Upcoming', type: 'deadline' },
        { date: 'Jan 11 - Jan 23, 2027', title: 'Semester I Final Examinations & Faculty Grading', status: 'Upcoming', type: 'exam' },
        { date: 'Jan 29, 2027', title: 'Senate Approval & Official Grade Publication', status: 'Upcoming', type: 'senate' },
      ],
    },
    {
      name: 'Semester II (Spring 2027)',
      status: 'Upcoming Session',
      isCurrent: false,
      events: [
        { date: 'Feb 15 - Feb 26, 2027', title: 'Semester II Registration & Tuition Settlement', status: 'Scheduled', type: 'registration' },
        { date: 'Mar 01, 2027', title: 'Commencement of Academic Lectures (All Campuses)', status: 'Scheduled', type: 'classes' },
        { date: 'Apr 12 - Apr 17, 2027', title: 'Mid-Semester Assessments & Progress Reports', status: 'Scheduled', type: 'exam' },
        { date: 'Jun 07 - Jun 19, 2027', title: 'Semester II Final Examinations', status: 'Scheduled', type: 'exam' },
        { date: 'Jul 15, 2027', title: 'Annual University Commencement & Convocation Exercises', status: 'Scheduled', type: 'convocation' },
      ],
    },
  ];

  return (
    <section id="calendar" className="py-16 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Senate Approved
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
            Official Academic Calendar 2026/2027
          </h2>
          <p className="text-slate-400 mt-2 text-base">
            Structured in compliance with National Commission on Higher Education guidelines, featuring clearly bounded Add/Drop and examination windows.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {semesters.map((sem, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 sm:p-8 border shadow-xl ${
                sem.isCurrent
                  ? 'bg-slate-900 border-amber-500/40 relative'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {sem.isCurrent && (
                <div className="absolute -top-3 right-6 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow">
                  Current Semester
                </div>
              )}

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{sem.name}</h3>
                  <span className="text-xs text-slate-400">{sem.status}</span>
                </div>
              </div>

              <div className="space-y-4">
                {sem.events.map((ev, eIdx) => (
                  <div
                    key={eIdx}
                    className="flex items-start gap-4 p-3 rounded-xl bg-slate-850/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="shrink-0 w-28 text-xs font-semibold text-amber-400/90 pt-0.5">
                      {ev.date}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-200">{ev.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ev.status === 'Active Now'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              : ev.status === 'Completed'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
