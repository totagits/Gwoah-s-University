import ICAL from 'ical.js';
import { XMLParser } from 'fast-xml-parser';
type Busy = { start: string; end: string };
export function parseBusyCalendar(ics: string, start: Date, end: Date): Busy[] {
  const calendar = new ICAL.Component(ICAL.parse(ics));
  for (const component of calendar.getAllSubcomponents('vtimezone'))
    ICAL.TimezoneService.register(new ICAL.Timezone({ component }));
  const busy: Busy[] = [];
  for (const component of calendar.getAllSubcomponents('vevent')) {
    if (
      component.getFirstPropertyValue('status') === 'CANCELLED' ||
      component.getFirstPropertyValue('transp') === 'TRANSPARENT'
    )
      continue;
    const event = new ICAL.Event(component);
    const add = (from: any, to: any) => {
      const a = from.toJSDate(),
        b = to.toJSDate();
      if (a < end && b > start)
        busy.push({ start: a.toISOString(), end: b.toISOString() });
    };
    if (event.isRecurring()) {
      const iterator = event.iterator();
      for (let n = 0; n < 5000; n++) {
        const next = iterator.next();
        if (!next || next.toJSDate() >= end) break;
        const occurrence = event.getOccurrenceDetails(next);
        add(occurrence.startDate, occurrence.endDate);
      }
    } else add(event.startDate, event.endDate);
    if (busy.length > 2000) throw Error('Calendar result is too large.');
  }
  return busy;
}
function configuration() {
  const url = process.env.CALDAV_URL;
  if (!url || !process.env.CALDAV_USERNAME || !process.env.CALDAV_PASSWORD)
    throw Error('CalDAV is not connected.');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw Error('CalDAV requires HTTPS.');
  return {
    url: parsed,
    authorization:
      'Basic ' +
      Buffer.from(
        process.env.CALDAV_USERNAME + ':' + process.env.CALDAV_PASSWORD,
      ).toString('base64'),
  };
}
const stamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
export async function readCalendarAvailability(start: Date, end: Date) {
  const { url, authorization } = configuration();
  const body = `<?xml version="1.0" encoding="utf-8"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"><c:time-range start="${stamp(start)}" end="${stamp(end)}"/></c:comp-filter></c:comp-filter></c:filter></c:calendar-query>`;
  const response = await fetch(url, {
    method: 'REPORT',
    headers: {
      Authorization: authorization,
      Depth: '1',
      'Content-Type': 'application/xml; charset=utf-8',
    },
    body,
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw Error(
      `Calendar provider rejected availability query (${response.status}).`,
    );
  const xml = await response.text();
  if (xml.length > 5000000 || /<!DOCTYPE|<!ENTITY/i.test(xml))
    throw Error('Calendar response is unsupported.');
  const parsed = new XMLParser({
    removeNSPrefix: true,
    processEntities: false,
    ignoreAttributes: true,
    parseTagValue: false,
  }).parse(xml);
  const rows = parsed.multistatus?.response;
  if (!rows) return [];
  const result: Busy[] = [];
  for (const row of Array.isArray(rows) ? rows : [rows]) {
    for (const propstat of Array.isArray(row.propstat)
      ? row.propstat
      : [row.propstat]) {
      const data = propstat?.prop?.['calendar-data'];
      if (typeof data === 'string')
        result.push(...parseBusyCalendar(data, start, end));
    }
  }
  return result;
}
export async function publishCalendarBooking(booking: {
  id: string;
  start: string;
  end: string;
  title: string;
}) {
  const { url, authorization } = configuration();
  const uid = 'gu-' + booking.id;
  const target = new URL(
    url.href.replace(/\/?$/, '/') + encodeURIComponent(uid) + '.ics',
  );
  const text = booking.title
    .replace(/\\/g, '\\\\')
    .replace(/[\r\n]/g, ' ')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .slice(0, 200);
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gwoah University//Scheduling//EN',
    'BEGIN:VEVENT',
    `UID:${uid}@gwoahuniversity`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(new Date(booking.start))}`,
    `DTEND:${stamp(new Date(booking.end))}`,
    `SUMMARY:${text}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
  const response = await fetch(target, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': 'text/calendar; charset=utf-8',
      'If-None-Match': '*',
    },
    body,
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok && response.status !== 412)
    throw Error(`Calendar provider rejected booking (${response.status}).`);
  return { synced: true };
}
