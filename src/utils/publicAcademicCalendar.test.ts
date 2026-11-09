import test from 'node:test';
import assert from 'node:assert/strict';
import {academicTermStatus,academicWindowStatus,currentLiberiaDay,parseAcademicDateWindow} from './publicAcademicCalendar';

const day=(year:number,month:number,date:number)=>Date.UTC(year,month-1,date);

test('academic calendar parses the university-provided single dates and date ranges',()=>{
  assert.deepEqual(parseAcademicDateWindow('Oct 12 - Oct 26, 2026'),
    {start:day(2026,10,12),end:day(2026,10,26)});
  assert.deepEqual(parseAcademicDateWindow('Mar 01, 2027'),
    {start:day(2027,3,1),end:day(2027,3,1)});
  assert.equal(parseAcademicDateWindow('Feb 31, 2027'),null);
  assert.equal(parseAcademicDateWindow('invalid event'),null);
});

test('old hard-coded Active Now window is correctly marked past in November',()=>{
  assert.equal(academicWindowStatus('Oct 12 - Oct 26, 2026',day(2026,11,9)),'Date passed');
  assert.equal(academicWindowStatus('Nov 16 - Nov 21, 2026',day(2026,11,9)),'Upcoming');
  assert.equal(academicWindowStatus('Nov 16 - Nov 21, 2026',day(2026,11,19)),'Scheduled now');
  assert.equal(academicWindowStatus('Oct 12 - Oct 26, 2026',day(2026,10,12)),'Scheduled now');
  assert.equal(academicWindowStatus('invalid event',day(2026,11,9)),'Date unverified');
});

test('current-term badge is derived from the published first and last dates',()=>{
  const events=[{date:'Oct 01 - Oct 10, 2026'},{date:'Jan 29, 2027'}];
  assert.equal(academicTermStatus(events,day(2026,9,30)),'Future term');
  assert.equal(academicTermStatus(events,day(2026,11,9)),'Current term');
  assert.equal(academicTermStatus(events,day(2027,2,1)),'Past term');
});

test('calendar status is evaluated in Liberia time rather than viewer time zone',()=>{
  assert.equal(currentLiberiaDay(new Date('2026-11-09T00:40:00Z')),day(2026,11,9));
});
