import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  CalendarCheck,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Info,
} from 'lucide-react';
import { AcademicCalendarEvent, CalendarEventType, UserProfile } from '../../types';
import { api } from '../../services/api';
import {
  generateIcsCalendar,
  generateIcsEvent,
  generateGoogleCalendarUrl,
  filterCalendarEvents,
  getEventUrgency,
  downloadIcsFile,
} from '../../utils/calendarSync';
import { INITIAL_CALENDAR_EVENTS } from '../../data/calendarData';

interface AcademicCalendarViewProps {
  currentUser: UserProfile;
}

export const AcademicCalendarView: React.FC<AcademicCalendarViewProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<AcademicCalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<CalendarEventType | 'all'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await api.getCalendarEvents();
      if (res.events && res.events.length > 0) {
        setEvents(res.events);
      }
    } catch (err) {
      console.warn('Failed to load backend calendar events, using seeded institutional events:', err);
      setEvents(INITIAL_CALENDAR_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredEvents = filterCalendarEvents(events, {
    eventType: selectedType,
    search: searchQuery,
    courseCode: selectedCourse,
  });

  // Export full calendar as .ics
  const handleExportAll = () => {
    const icsContent = generateIcsCalendar(
      events,
      "Gwoah's University Senate Academic Calendar 2026-2027"
    );
    const success = downloadIcsFile('gwoahs_university_academic_calendar.ics', icsContent);
    if (success) {
      showToast('Downloaded full academic calendar (.ics) for Apple Calendar / Outlook / Android.');
    }
  };

  // Export only exams
  const handleExportExamsOnly = () => {
    const examEvents = events.filter((e) => e.eventType === 'exam');
    const icsContent = generateIcsCalendar(
      examEvents,
      "Gwoah's University Final & Midterm Examination Schedule"
    );
    const success = downloadIcsFile('gwoahs_university_exam_schedule.ics', icsContent);
    if (success) {
      showToast(`Exported ${examEvents.length} exam dates to .ics file.`);
    }
  };

  // Export single event as .ics
  const handleExportSingleEvent = (event: AcademicCalendarEvent) => {
    const icsContent = generateIcsCalendar([event], event.title);
    const filename = `${event.id}_${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.ics`;
    const success = downloadIcsFile(filename, icsContent);
    if (success) {
      showToast(`Exported "${event.title}" to .ics.`);
    }
  };

  const formatDateDisplay = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEventTypeBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'exam':
        return (
          <span className="bg-rose-950/70 text-rose-300 border border-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Exam
          </span>
        );
      case 'registration':
        return (
          <span className="bg-blue-950/70 text-blue-300 border border-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <CalendarCheck className="w-3 h-3" /> Registration Deadline
          </span>
        );
      case 'financial':
        return (
          <span className="bg-amber-950/70 text-amber-300 border border-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Financial Clearance
          </span>
        );
      case 'holiday':
        return (
          <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Recess / Holiday
          </span>
        );
      case 'senate':
        return (
          <span className="bg-purple-950/70 text-purple-300 border border-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Senate Milestone
          </span>
        );
    }
  };

  const coursesList = Array.from(
    new Set(events.filter((e) => e.courseCode).map((e) => e.courseCode!))
  );

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner / Sync Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official Senate Calendar
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Term: Semester I 2026/2027
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Academic Calendar & Exam Schedule Sync
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Export verified examination timetables, Senate registration deadlines, and financial clearance milestones directly to your personal calendar (Apple Calendar, Microsoft Outlook, Google Calendar, Android).
            </p>
          </div>

          {/* Sync & Export Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer hover:shadow-amber-500/20"
              title="Download RFC 5545 iCalendar file for all events"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Calendar (.ics)</span>
            </button>

            <button
              onClick={handleExportExamsOnly}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              title="Export only examination timetable"
            >
              <Calendar className="w-4 h-4 text-rose-400" />
              <span>Export Exams Only</span>
            </button>
          </div>
        </div>

        {/* NCHE & Low-Bandwidth Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              All exam dates accredited under <strong>NCHE Standard 4.2 / HEQAF</strong> Liberian Higher Education Guidelines.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>Total Events:</span>
            <strong className="text-amber-400 font-bold">{events.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam, course (e.g. CSC 301), hall..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Type & Course Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            aria-label="Filter by Event Category"
          >
            <option value="all">All Categories</option>
            <option value="exam">Exams & Moderations</option>
            <option value="registration">Registration Deadlines</option>
            <option value="financial">Financial Clearance</option>
            <option value="holiday">Recess & Holidays</option>
            <option value="senate">Senate Milestones</option>
          </select>

          {coursesList.length > 0 && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
              aria-label="Filter by Course Code"
            >
              <option value="all">All Courses</option>
              {coursesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {(selectedType !== 'all' || selectedCourse !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedCourse('all');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-300 text-xs font-semibold px-2 py-1 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No matching calendar milestones found.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or changing filters.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const urgency = getEventUrgency(event.startDate);
            const googleCalUrl = generateGoogleCalendarUrl(event);

            return (
              <div
                key={event.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-md hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Event Details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getEventTypeBadge(event.eventType)}

                    {event.courseCode && (
                      <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {event.courseCode}
                      </span>
                    )}

                    <span
                      className={`text-[11px] font-medium border px-2 py-0.5 rounded-full ${urgency.badgeClass}`}
                    >
                      {urgency.label}
                    </span>

                    {event.isMandatory && (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Mandatory
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                    {event.description}
                  </p>

                  {/* Metadata Row: Date, Location, Statutory */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatDateDisplay(event.startDate)}</span>
                    </span>

                    {event.location && (
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{event.location}</span>
                      </span>
                    )}

                    {event.statutoryRef && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Info className="w-3 h-3 text-slate-500" />
                        <span>{event.statutoryRef}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Event Calendar Quick Actions */}
                <div className="flex items-center sm:self-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Add to Google Calendar */}
                  <a
                    href={googleCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                    title="Add directly to your Google Calendar"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Google Calendar</span>
                  </a>

                  {/* Download single .ics */}
                  <button
                    onClick={() => handleExportSingleEvent(event)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                    title="Download iCal / Outlook file (.ics)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>iCal / Outlook</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
