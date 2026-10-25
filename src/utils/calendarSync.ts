import { AcademicCalendarEvent, CalendarEventType } from '../types';

/**
 * Clean and escape text for RFC 5545 iCalendar format.
 */
export function cleanIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
    .trim();
}

/**
 * Format ISO date string into iCalendar UTC/Local format (YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS).
 */
export function formatIcsDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // Fallback if parsing fails
    const sanitized = dateStr.replace(/[-:]/g, '').replace(/\..+/, '');
    return sanitized.length === 8 ? `${sanitized}T000000` : sanitized;
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate a single VEVENT block adhering to RFC 5545 specification.
 */
export function generateIcsEvent(event: AcademicCalendarEvent): string {
  const dtStart = formatIcsDateTime(event.startDate);
  const dtEnd = formatIcsDateTime(event.endDate || event.startDate);
  const now = formatIcsDateTime(new Date().toISOString());
  const uid = `${event.id}@gwoah.edu.lr`;
  const summary = cleanIcsText(event.title);
  
  let description = `${event.description}`;
  if (event.statutoryRef) {
    description += `\nStatutory Reference: ${event.statutoryRef}`;
  }
  if (event.term) {
    description += `\nTerm: ${event.term}`;
  }
  description += `\nSystem: Gwoah's University ERP Calendar Sync`;
  const cleanDesc = cleanIcsText(description);
  const cleanLoc = cleanIcsText(event.location || "Gwoah's University Campus");

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLoc}`,
    `STATUS:CONFIRMED`,
    `CATEGORIES:${event.eventType.toUpperCase()}`,
    'TRANSP:OPAQUE',
    'END:VEVENT',
  ];

  return lines.join('\r\n');
}

/**
 * Generate a complete RFC 5545 .ics iCalendar payload for multiple events.
 */
export function generateIcsCalendar(
  events: AcademicCalendarEvent[],
  calendarName: string = "Gwoah's University Academic Calendar"
): string {
  const cleanCalName = cleanIcsText(calendarName);
  const eventBlocks = events.map(generateIcsEvent).join('\r\n');

  const icsFileLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gwoahs University//ERP Academic Calendar Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${cleanCalName}`,
    'X-WR-TIMEZONE:UTC',
    eventBlocks,
    'END:VCALENDAR',
  ];

  return icsFileLines.join('\r\n');
}

/**
 * Generates a direct web URL to add an event to Google Calendar in one click.
 */
export function generateGoogleCalendarUrl(event: AcademicCalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  const startFormatted = formatIcsDateTime(event.startDate);
  const endFormatted = formatIcsDateTime(event.endDate || event.startDate);

  let details = `${event.description}\n\nTerm: ${event.term}`;
  if (event.statutoryRef) {
    details += `\nStatutory Authority: ${event.statutoryRef}`;
  }
  details += "\nSource: Gwoah's University Student Portal";

  const params = new URLSearchParams({
    text: event.title,
    dates: `${startFormatted}/${endFormatted}`,
    details,
    location: event.location || "Gwoah's University Campus, Monrovia, Liberia",
  });

  return `${baseUrl}&${params.toString()}`;
}

/**
 * Pure filter logic for calendar events.
 */
export function filterCalendarEvents(
  events: AcademicCalendarEvent[],
  filters: {
    eventType?: CalendarEventType | 'all';
    search?: string;
    courseCode?: string;
  }
): AcademicCalendarEvent[] {
  return events.filter((ev) => {
    if (filters.eventType && filters.eventType !== 'all') {
      if (ev.eventType !== filters.eventType) return false;
    }
    if (filters.courseCode && filters.courseCode !== 'all') {
      if (ev.courseCode?.toLowerCase() !== filters.courseCode.toLowerCase()) {
        return false;
      }
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description.toLowerCase().includes(q);
      const matchLoc = ev.location ? ev.location.toLowerCase().includes(q) : false;
      const matchCourse = ev.courseCode ? ev.courseCode.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchDesc && !matchLoc && !matchCourse) return false;
    }
    return true;
  });
}

/**
 * Calculate countdown and relative urgency for student deadline badges.
 */
export function getEventUrgency(
  startDateStr: string,
  referenceDate: Date = new Date()
): {
  daysRemaining: number;
  isPast: boolean;
  isToday: boolean;
  label: string;
  badgeClass: string;
} {
  const target = new Date(startDateStr);
  const diffMs = target.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      daysRemaining: diffDays,
      isPast: true,
      isToday: false,
      label: 'Concluded',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
    };
  }

  if (diffDays === 0) {
    return {
      daysRemaining: 0,
      isPast: false,
      isToday: true,
      label: 'Happening Today!',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700 animate-pulse',
    };
  }

  if (diffDays <= 7) {
    return {
      daysRemaining: diffDays,
      isPast: false,
      isToday: false,
      label: `In ${diffDays} day${diffDays === 1 ? '' : 's'} (Urgent)`,
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700 font-semibold',
    };
  }

  return {
    daysRemaining: diffDays,
    isPast: false,
    isToday: false,
    label: `In ${diffDays} days`,
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
  };
}

/**
 * Trigger client-side download of an .ics file using an invisible anchor element with blob URL.
 */
export function downloadIcsFile(filename: string, icsContent: string): boolean {
  if (typeof window === 'undefined' || !window.Blob) return false;
  try {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to trigger .ics download:', err);
    return false;
  }
}
