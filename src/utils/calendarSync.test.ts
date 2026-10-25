import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanIcsText,
  formatIcsDateTime,
  generateIcsEvent,
  generateIcsCalendar,
  generateGoogleCalendarUrl,
  filterCalendarEvents,
  getEventUrgency,
} from './calendarSync';
import { AcademicCalendarEvent } from '../types';

const sampleEvent: AcademicCalendarEvent = {
  id: 'cal-test-exam',
  title: 'CSC 301 Final Exam, Section A',
  description: 'Formal 3-hour examination; bring ID.',
  eventType: 'exam',
  startDate: '2026-11-25T10:00:00Z',
  endDate: '2026-11-25T13:00:00Z',
  location: 'Hall A-101',
  courseCode: 'CSC 301',
  isMandatory: true,
  statutoryRef: 'Senate Mandate 2026-04',
  term: 'Semester I 2026/2027',
};

test('cleanIcsText escapes semicolons, commas, and newlines correctly', () => {
  const raw = 'Math, Science; Physics\nLine 2';
  const cleaned = cleanIcsText(raw);
  assert.equal(cleaned, 'Math\\, Science\\; Physics\\nLine 2');
});

test('formatIcsDateTime outputs ISO date in UTC format ending in Z', () => {
  const formatted = formatIcsDateTime('2026-11-25T10:00:00Z');
  assert.equal(formatted, '20261125T100000Z');
});

test('generateIcsEvent creates valid VEVENT block with required RFC 5545 fields', () => {
  const icsEvent = generateIcsEvent(sampleEvent);
  assert.match(icsEvent, /^BEGIN:VEVENT/m);
  assert.match(icsEvent, /UID:cal-test-exam@gwoah\.edu\.lr/);
  assert.match(icsEvent, /DTSTART:20261125T100000Z/);
  assert.match(icsEvent, /DTEND:20261125T130000Z/);
  assert.match(icsEvent, /SUMMARY:CSC 301 Final Exam\\, Section A/);
  assert.match(icsEvent, /CATEGORIES:EXAM/);
  assert.match(icsEvent, /END:VEVENT$/m);
});

test('generateIcsCalendar wraps multiple events in valid VCALENDAR envelope', () => {
  const events: AcademicCalendarEvent[] = [
    sampleEvent,
    {
      id: 'cal-test-reg',
      title: 'Add/Drop Deadline',
      description: 'Course registration closes.',
      eventType: 'registration',
      startDate: '2026-10-30T17:00:00Z',
      endDate: '2026-10-30T23:59:59Z',
      isMandatory: true,
      term: 'Semester I 2026/2027',
    },
  ];

  const fullCalendar = generateIcsCalendar(events, 'Gwoah Test Calendar');
  assert.match(fullCalendar, /^BEGIN:VCALENDAR/m);
  assert.match(fullCalendar, /VERSION:2\.0/);
  assert.match(fullCalendar, /X-WR-CALNAME:Gwoah Test Calendar/);
  assert.match(fullCalendar, /UID:cal-test-exam@gwoah\.edu\.lr/);
  assert.match(fullCalendar, /UID:cal-test-reg@gwoah\.edu\.lr/);
  assert.match(fullCalendar, /END:VCALENDAR$/m);
});

test('generateGoogleCalendarUrl generates encoded URL with action=TEMPLATE and dates', () => {
  const url = generateGoogleCalendarUrl(sampleEvent);
  assert.match(url, /^https:\/\/calendar\.google\.com\/calendar\/render\?action=TEMPLATE/);
  assert.match(url, /text=CSC\+301\+Final\+Exam%2C\+Section\+A/);
  assert.match(url, /dates=20261125T100000Z%2F20261125T130000Z/);
  assert.match(url, /location=Hall\+A-101/);
});

test('filterCalendarEvents accurately filters by type, courseCode, and search query', () => {
  const events: AcademicCalendarEvent[] = [
    sampleEvent,
    {
      id: 'cal-2',
      title: 'Add/Drop Closure',
      description: 'Final day for enrollment changes',
      eventType: 'registration',
      startDate: '2026-10-30T17:00:00Z',
      endDate: '2026-10-30T23:59:59Z',
      isMandatory: true,
      term: 'Semester I',
    },
  ];

  const examsOnly = filterCalendarEvents(events, { eventType: 'exam' });
  assert.equal(examsOnly.length, 1);
  assert.equal(examsOnly[0].id, 'cal-test-exam');

  const cscOnly = filterCalendarEvents(events, { courseCode: 'CSC 301' });
  assert.equal(cscOnly.length, 1);

  const searchResults = filterCalendarEvents(events, { search: 'enrollment' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 'cal-2');
});

test('getEventUrgency correctly categorizes future, today, and past deadlines', () => {
  const refDate = new Date('2026-10-25T12:00:00Z');

  // 5.2 days away (Urgent)
  const urgent = getEventUrgency('2026-10-30T17:00:00Z', refDate);
  assert.equal(urgent.isPast, false);
  assert.equal(urgent.isToday, false);
  assert.match(urgent.label, /In 6 days \(Urgent\)/);

  // Past event
  const past = getEventUrgency('2026-10-20T10:00:00Z', refDate);
  assert.equal(past.isPast, true);
  assert.equal(past.label, 'Concluded');
});
