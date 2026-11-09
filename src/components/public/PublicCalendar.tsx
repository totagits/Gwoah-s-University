import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import {academicTermStatus,academicWindowStatus,currentLiberiaDay} from '../../utils/publicAcademicCalendar';

export const PublicCalendar: React.FC = () => {
  const today=currentLiberiaDay();
  const semesters = [
    {
      name: 'SEMESTER I (FALL 2026)',
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
      name: 'SEMESTER II (SPRING 2027)',
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
    <section id="calendar" className="py-16 bg-[#FAF8FB] text-[#2E0F34] border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C39A53] bg-[#4A1249] px-3.5 py-1.5 rounded-full border border-[#C39A53]/30 shadow-xs">
            Senate Approved
          </span>
          <h2 className="text-4xl sm:text-5xl font-collegiate font-black mt-3 tracking-tight text-[#4A1249]">
            OFFICIAL ACADEMIC CALENDAR 2026/2027
          </h2>
          <p className="text-slate-600 mt-2 text-base leading-relaxed">
            Dates are shown as listed in the HIAU academic calendar. Status labels reflect the current date in Liberia, not confirmation that an activity has taken place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {semesters.map((sem, idx) => {
            const termStatus=academicTermStatus(sem.events,today);
            const isCurrent=termStatus==='Current term';
            return <div
              key={idx}
              className={`rounded-xl p-6 sm:p-8 border shadow-sm transition-all ${
                isCurrent
                  ? 'bg-white border-2 border-[#4A1249] border-t-4 border-t-[#C39A53] relative shadow-md'
                  : 'bg-white border border-purple-200/80'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 right-6 bg-[#4A1249] text-[#C39A53] text-xs font-bold px-3 py-1 rounded shadow border border-[#C39A53]/40 uppercase tracking-wider">
                  Current Active Term
                </div>
              )}

              <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-purple-100">
                <div className="p-2.5 rounded bg-[#4A1249] text-[#C39A53]">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-collegiate font-bold text-[#4A1249] tracking-tight">{sem.name}</h3>
                  <span className="text-xs text-[#C39A53] font-bold uppercase tracking-wider">{termStatus}</span>
                </div>
              </div>

              <div className="space-y-3">
                {sem.events.map((ev, eIdx) => {
                  const status=academicWindowStatus(ev.date,today);
                  return <div
                    key={eIdx}
                    className="flex items-start gap-4 p-3.5 rounded bg-[#FAF8FB] border border-purple-200/60 hover:border-[#C39A53]/60 transition-colors"
                  >
                    <div className="shrink-0 w-28 text-xs font-bold text-[#4A1249] pt-0.5 font-mono">
                      {ev.date}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#2E0F34]">{ev.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            status === 'Scheduled now'
                              ? 'bg-[#4A1249] text-[#C39A53] border border-[#C39A53]/30'
                              : status === 'Date passed'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-[#FAF4E8] text-[#A17A32] border border-[#E7D5B5]'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>;
                })}
              </div>
            </div>;
          })}
        </div>
      </div>
    </section>
  );
};
